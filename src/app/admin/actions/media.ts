"use server";
import { db } from "@/lib/db";
import { fail, guard, logActivity, refreshSite, toFail, zodFail, type ActionResult } from "@/lib/action";
import { deleteUpload, saveUpload } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { albumSchema, videoSchema } from "@/lib/validation";

export async function createAlbum(input: unknown): Promise<ActionResult<{ id: string }>> {
  const me = await guard();
  const p = albumSchema.safeParse(input);
  if (!p.success) return zodFail(p.error);
  let slug = slugify(p.data.name);
  if (await db.album.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
  const count = await db.album.count();
  const album = await db.album.create({ data: { name: p.data.name, slug, sort: count } });
  await logActivity(me.name, `created album “${album.name}”`, "gallery");
  refreshSite("gallery");
  return { ok: true, data: { id: album.id }, message: "Album created" };
}

export async function renameAlbum(id: string, input: unknown): Promise<ActionResult> {
  await guard();
  const p = albumSchema.safeParse(input);
  if (!p.success) return zodFail(p.error);
  await db.album.update({ where: { id }, data: { name: p.data.name } });
  refreshSite("gallery");
  return { ok: true, message: "Album renamed" };
}

export async function deleteAlbum(id: string): Promise<ActionResult> {
  const me = await guard();
  const album = await db.album.findUnique({ where: { id }, include: { photos: true } });
  if (!album) return fail("Album not found.");
  await Promise.all(album.photos.map((ph) => deleteUpload(ph.url)));
  await db.album.delete({ where: { id } });
  await logActivity(me.name, `deleted album “${album.name}”`, "gallery");
  refreshSite("gallery");
  return { ok: true };
}

export async function uploadPhotos(albumId: string, formData: FormData): Promise<ActionResult<{ count: number }>> {
  const me = await guard();
  try {
    const album = await db.album.findUnique({ where: { id: albumId } });
    if (!album) return fail("Album not found.");
    const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
    if (!files.length) return fail("Choose at least one photo.");
    if (files.length > 20) return fail("Upload up to 20 photos at a time.");
    const last = await db.photo.findFirst({ where: { albumId }, orderBy: { sort: "desc" } });
    let sort = (last?.sort ?? -1) + 1;
    for (const f of files) {
      const up = await saveUpload(f, "image", "gallery");
      await db.photo.create({ data: { albumId, url: up.url, caption: f.name.replace(/\.[^.]+$/, ""), sort: sort++ } });
    }
    await logActivity(me.name, `uploaded ${files.length} photo${files.length > 1 ? "s" : ""} to “${album.name}”`, "gallery");
    refreshSite("gallery");
    return { ok: true, data: { count: files.length }, message: `${files.length} photo${files.length > 1 ? "s" : ""} uploaded` };
  } catch (e) {
    return toFail(e);
  }
}

export async function deletePhotos(ids: string[]): Promise<ActionResult> {
  const me = await guard();
  const photos = await db.photo.findMany({ where: { id: { in: ids } } });
  await Promise.all(photos.map((p) => deleteUpload(p.url)));
  await db.photo.deleteMany({ where: { id: { in: ids } } });
  await logActivity(me.name, `deleted ${photos.length} photo${photos.length > 1 ? "s" : ""}`, "gallery");
  refreshSite("gallery");
  return { ok: true };
}

export async function saveVideo(id: string | null, input: unknown): Promise<ActionResult> {
  const me = await guard();
  const p = videoSchema.safeParse(input);
  if (!p.success) return zodFail(p.error);
  if (p.data.featured) await db.video.updateMany({ data: { featured: false } });
  if (id) await db.video.update({ where: { id }, data: p.data });
  else await db.video.create({ data: { ...p.data, sort: await db.video.count() } });
  await logActivity(me.name, `${id ? "updated" : "added"} video “${p.data.title}”`, "gallery");
  refreshSite("videos");
  return { ok: true, message: id ? "Video updated" : "Video added" };
}

export async function deleteVideo(id: string): Promise<ActionResult> {
  const me = await guard();
  const v = await db.video.delete({ where: { id } });
  await logActivity(me.name, `deleted video “${v.title}”`, "gallery");
  refreshSite("videos");
  return { ok: true };
}
