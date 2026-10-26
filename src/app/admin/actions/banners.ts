"use server";
import { db } from "@/lib/db";
import { fail, guard, logActivity, refreshSite, toFail, zodFail, type ActionResult } from "@/lib/action";
import { deleteUpload, saveUpload } from "@/lib/storage";
import { bannerSchema } from "@/lib/validation";

export async function saveBanner(formData: FormData): Promise<ActionResult> {
  const me = await guard();
  try {
    const id = String(formData.get("id") ?? "") || null;
    const parsed = bannerSchema.safeParse(JSON.parse(String(formData.get("json") ?? "{}")));
    if (!parsed.success) return zodFail(parsed.error);
    if (parsed.data.ctaLabel && !parsed.data.ctaHref) return fail("Add a link for the button.", { ctaHref: "Link is required when the button has a label" });

    const existing = id ? await db.banner.findUnique({ where: { id } }) : null;
    let imageUrl = existing?.imageUrl ?? null;
    const image = formData.get("image");
    if (image instanceof File && image.size > 0) {
      const up = await saveUpload(image, "image", "banners");
      await deleteUpload(imageUrl);
      imageUrl = up.url;
    } else if (formData.get("removeImage") === "1") {
      await deleteUpload(imageUrl);
      imageUrl = null;
    }

    const data = { ...parsed.data, imageUrl };
    if (id) await db.banner.update({ where: { id }, data });
    else await db.banner.create({ data: { ...data, sort: await db.banner.count() } });
    await logActivity(me.name, `${id ? "updated" : "added"} banner “${data.title.slice(0, 40)}”`, "post");
    refreshSite();
    return { ok: true, message: id ? "Banner updated" : "Banner added" };
  } catch (e) {
    return toFail(e);
  }
}

export async function setBannerActive(id: string, active: boolean): Promise<ActionResult> {
  await guard();
  await db.banner.update({ where: { id }, data: { active } });
  refreshSite();
  return { ok: true };
}

export async function reorderBanners(ids: string[]): Promise<ActionResult> {
  await guard();
  await db.$transaction(ids.map((id, i) => db.banner.update({ where: { id }, data: { sort: i } })));
  refreshSite();
  return { ok: true };
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  const me = await guard();
  const b = await db.banner.findUnique({ where: { id } });
  if (!b) return fail("Banner not found.");
  await deleteUpload(b.imageUrl);
  await db.banner.delete({ where: { id } });
  await logActivity(me.name, `deleted banner “${b.title.slice(0, 40)}”`, "post");
  refreshSite();
  return { ok: true };
}
