"use server";
import { db } from "@/lib/db";
import { fail, guard, logActivity, refreshSite, toFail, zodFail, type ActionResult } from "@/lib/action";
import { deleteUpload, saveUpload } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { postSchema } from "@/lib/validation";

async function uniqueSlug(base: string, ignoreId?: string) {
  let slug = base;
  let i = 2;
   
  while (await db.post.findFirst({ where: { slug, ...(ignoreId ? { NOT: { id: ignoreId } } : {}) } })) slug = `${base}-${i++}`;
  return slug;
}

export async function savePost(formData: FormData): Promise<ActionResult<{ id: string }>> {
  const me = await guard();
  try {
    const raw = JSON.parse(String(formData.get("json") ?? "{}"));
    const intent = String(formData.get("intent") ?? "draft"); // draft | publish
    const id = String(formData.get("id") ?? "") || null;
    const parsed = postSchema.safeParse(raw);
    if (!parsed.success) return zodFail(parsed.error);
    const d = parsed.data;

    const slug = await uniqueSlug(d.slug || slugify(d.title), id ?? undefined);
    const existing = id ? await db.post.findUnique({ where: { id } }) : null;

    let coverUrl = existing?.coverUrl ?? null;
    const cover = formData.get("cover");
    if (cover instanceof File && cover.size > 0) {
      const up = await saveUpload(cover, "image", "covers");
      await deleteUpload(coverUrl);
      coverUrl = up.url;
    } else if (formData.get("removeCover") === "1") {
      await deleteUpload(coverUrl);
      coverUrl = null;
    }

    const when = d.publishedAt ? new Date(d.publishedAt) : null;
    if (when && Number.isNaN(when.getTime())) return fail("Invalid publish date.", { publishedAt: "Invalid date" });

    let status = existing?.status ?? "DRAFT";
    let publishedAt = when ?? existing?.publishedAt ?? null;
    if (intent === "publish") {
      if (when && when.getTime() > Date.now() + 60_000) status = "SCHEDULED";
      else {
        status = "PUBLISHED";
        publishedAt = when ?? new Date();
      }
    }

    const data = {
      title: d.title,
      slug,
      type: d.type,
      excerpt: d.excerpt,
      body: d.body,
      tags: d.tags,
      featured: d.featured,
      coverUrl,
      status,
      publishedAt,
    };
    const post = id
      ? await db.post.update({ where: { id }, data })
      : await db.post.create({ data: { ...data, authorName: me.name } });

    await logActivity(me.name, `${intent === "publish" ? "published" : "saved a draft of"} “${post.title.slice(0, 48)}”`, "post");
    refreshSite("posts");
    return { ok: true, data: { id: post.id }, message: intent === "publish" ? "Post published" : "Draft saved" };
  } catch (e) {
    return toFail(e);
  }
}

export async function trashPosts(ids: string[]): Promise<ActionResult> {
  const me = await guard();
  if (!ids.length) return fail("Nothing selected.");
  await db.post.updateMany({ where: { id: { in: ids } }, data: { deletedAt: new Date() } });
  await logActivity(me.name, `moved ${ids.length} post${ids.length > 1 ? "s" : ""} to Trash`, "post");
  refreshSite("posts");
  return { ok: true };
}

export async function restorePosts(ids: string[]): Promise<ActionResult> {
  const me = await guard();
  await db.post.updateMany({ where: { id: { in: ids } }, data: { deletedAt: null } });
  await logActivity(me.name, `restored ${ids.length} post${ids.length > 1 ? "s" : ""}`, "post");
  refreshSite("posts");
  return { ok: true };
}

export async function setPostsStatus(ids: string[], status: "PUBLISHED" | "DRAFT"): Promise<ActionResult> {
  const me = await guard();
  await db.post.updateMany({
    where: { id: { in: ids } },
    data: status === "PUBLISHED" ? { status, publishedAt: new Date() } : { status },
  });
  await logActivity(me.name, `${status === "PUBLISHED" ? "published" : "unpublished"} ${ids.length} post${ids.length > 1 ? "s" : ""}`, "post");
  refreshSite("posts");
  return { ok: true };
}

export async function duplicatePost(id: string): Promise<ActionResult> {
  const me = await guard();
  const p = await db.post.findUnique({ where: { id } });
  if (!p) return fail("Post not found.");
  const slug = await uniqueSlug(`${p.slug}-copy`);
  await db.post.create({
    data: { type: p.type, title: `${p.title} (copy)`, slug, excerpt: p.excerpt, body: p.body, tags: p.tags, coverUrl: p.coverUrl, authorName: me.name },
  });
  await logActivity(me.name, `duplicated “${p.title.slice(0, 40)}”`, "post");
  refreshSite("posts");
  return { ok: true };
}
