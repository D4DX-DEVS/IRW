"use server";
import { db } from "@/lib/db";
import { fail, guard, logActivity, refreshSite, toFail, zodFail, type ActionResult } from "@/lib/action";
import { deleteUpload, saveUpload } from "@/lib/storage";
import { teamSchema } from "@/lib/validation";

export async function saveMember(formData: FormData): Promise<ActionResult> {
  const me = await guard();
  try {
    const id = String(formData.get("id") ?? "") || null;
    const parsed = teamSchema.safeParse(JSON.parse(String(formData.get("json") ?? "{}")));
    if (!parsed.success) return zodFail(parsed.error);
    const existing = id ? await db.teamMember.findUnique({ where: { id } }) : null;

    let photoUrl = existing?.photoUrl ?? null;
    const photo = formData.get("photo");
    if (photo instanceof File && photo.size > 0) {
      const up = await saveUpload(photo, "image", "team");
      await deleteUpload(photoUrl);
      photoUrl = up.url;
    }
    const data = { ...parsed.data, phone: parsed.data.phone || null, photoUrl };
    if (id) await db.teamMember.update({ where: { id }, data });
    else await db.teamMember.create({ data: { ...data, sort: await db.teamMember.count({ where: { groupName: data.groupName } }) } });
    await logActivity(me.name, `${id ? "updated" : "added"} team member ${data.name}`, "team");
    refreshSite("team");
    return { ok: true, message: id ? "Member updated" : "Member added" };
  } catch (e) {
    return toFail(e);
  }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  const me = await guard();
  const m = await db.teamMember.findUnique({ where: { id } });
  if (!m) return fail("Member not found.");
  await deleteUpload(m.photoUrl);
  await db.teamMember.delete({ where: { id } });
  await logActivity(me.name, `removed team member ${m.name}`, "team");
  refreshSite("team");
  return { ok: true };
}

export async function setMemberVisible(id: string, visible: boolean): Promise<ActionResult> {
  await guard();
  await db.teamMember.update({ where: { id }, data: { visible } });
  refreshSite("team");
  return { ok: true };
}

export async function reorderMembers(ids: string[]): Promise<ActionResult> {
  await guard();
  await db.$transaction(ids.map((id, i) => db.teamMember.update({ where: { id }, data: { sort: i } })));
  refreshSite("team");
  return { ok: true };
}
