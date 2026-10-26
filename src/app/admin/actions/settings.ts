"use server";
import { db } from "@/lib/db";
import { guard, logActivity, refreshSite, zodFail, type ActionResult } from "@/lib/action";
import { settingsSchema } from "@/lib/validation";

export async function saveSettings(input: unknown): Promise<ActionResult> {
  const me = await guard();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) return zodFail(parsed.error);
  await db.$transaction(
    Object.entries(parsed.data).map(([key, value]) =>
      db.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } }),
    ),
  );
  await logActivity(me.name, "updated site settings", "settings");
  refreshSite();
  return { ok: true, message: "Settings saved" };
}
