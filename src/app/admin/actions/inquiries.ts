"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { guard, logActivity, type ActionResult } from "@/lib/action";

export async function markInquiryRead(id: string): Promise<ActionResult> {
  await guard();
  await db.inquiry.updateMany({ where: { id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function setInquiryStatus(id: string, status: "OPEN" | "RESOLVED"): Promise<ActionResult> {
  const me = await guard();
  const q = await db.inquiry.update({ where: { id }, data: { status, readAt: new Date() } });
  await logActivity(me.name, `${status === "RESOLVED" ? "resolved" : "reopened"} an inquiry from ${q.name}`, "inquiry");
  revalidatePath("/admin", "layout");
  return { ok: true };
}

export async function deleteInquiry(id: string): Promise<ActionResult> {
  const me = await guard();
  await db.inquiry.delete({ where: { id } });
  await logActivity(me.name, "deleted an inquiry", "inquiry");
  revalidatePath("/admin", "layout");
  return { ok: true };
}
