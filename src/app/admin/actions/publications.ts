"use server";
import { db } from "@/lib/db";
import { fail, guard, logActivity, refreshSite, toFail, zodFail, type ActionResult } from "@/lib/action";
import { deleteUpload, saveUpload } from "@/lib/storage";
import { publicationSchema } from "@/lib/validation";

export async function savePublication(formData: FormData): Promise<ActionResult> {
  const me = await guard();
  try {
    const id = String(formData.get("id") ?? "") || null;
    const parsed = publicationSchema.safeParse(JSON.parse(String(formData.get("json") ?? "{}")));
    if (!parsed.success) return zodFail(parsed.error);
    const file = formData.get("file");
    const existing = id ? await db.publication.findUnique({ where: { id } }) : null;

    let fileUrl = existing?.fileUrl ?? "";
    let sizeBytes = existing?.sizeBytes ?? 0;
    if (file instanceof File && file.size > 0) {
      const up = await saveUpload(file, "pdf", "publications");
      await deleteUpload(existing?.fileUrl);
      fileUrl = up.url;
      sizeBytes = up.size;
    }
    if (!fileUrl) return fail("Please attach a PDF.", { file: "PDF is required" });

    const data = { ...parsed.data, fileUrl, sizeBytes };
    if (id) await db.publication.update({ where: { id }, data });
    else await db.publication.create({ data });
    await logActivity(me.name, `${id ? "updated" : "uploaded"} publication “${data.title}”`, "publication");
    refreshSite("publications");
    return { ok: true, message: id ? "Publication updated" : "Publication uploaded" };
  } catch (e) {
    return toFail(e);
  }
}

export async function deletePublication(id: string): Promise<ActionResult> {
  const me = await guard();
  const p = await db.publication.findUnique({ where: { id } });
  if (!p) return fail("Publication not found.");
  await deleteUpload(p.fileUrl);
  await db.publication.delete({ where: { id } });
  await logActivity(me.name, `deleted publication “${p.title}”`, "publication");
  refreshSite("publications");
  return { ok: true };
}
