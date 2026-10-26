"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, destroySession } from "@/lib/auth";
import { db } from "@/lib/db";
import { fail, logActivity, zodFail, type ActionResult } from "@/lib/action";
import { loginSchema } from "@/lib/validation";

// naive in-memory throttle: 8 failures / 10 min per email
const attempts = new Map<string, { n: number; at: number }>();

export async function loginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return zodFail(parsed.error);
  const { email, password, remember } = parsed.data;
  const key = email.toLowerCase();

  const a = attempts.get(key);
  if (a && Date.now() - a.at < 10 * 60_000 && a.n >= 8) return fail("Too many attempts. Try again in a few minutes.");

  const user = await db.adminUser.findUnique({ where: { email: key } });
  const ok = user ? await bcrypt.compare(password, user.passwordHash) : await bcrypt.compare(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinva");
  if (!user || !ok) {
    attempts.set(key, { n: (a && Date.now() - a.at < 10 * 60_000 ? a.n : 0) + 1, at: Date.now() });
    return fail("Incorrect email or password.");
  }
  attempts.delete(key);
  await createSession({ id: user.id, email: user.email, name: user.name, role: user.role }, !!remember);
  await logActivity(user.name, "signed in", "info");
  return { ok: true };
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}
