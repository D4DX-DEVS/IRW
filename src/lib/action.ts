import "server-only";
import { revalidatePath } from "next/cache";
import type { ZodError } from "zod";
import { db } from "./db";
import { requireSession, type Session } from "./auth";
import { UploadError } from "./storage";

export type ActionResult<T = unknown> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export const fail = (error: string, fieldErrors?: Record<string, string>): ActionResult<never> => ({ ok: false, error, fieldErrors });

export function zodFail(e: ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of e.issues) {
    const k = String(issue.path[0] ?? "form");
    if (!fieldErrors[k]) fieldErrors[k] = issue.message;
  }
  return fail("Please fix the highlighted fields.", fieldErrors);
}

export async function guard(): Promise<Session> {
  return requireSession();
}

export async function logActivity(actor: string, verb: string, kind = "info") {
  await db.activity.create({ data: { actor, verb, kind } });
}

export function refreshSite() {
  revalidatePath("/", "layout");
}

export function toFail(e: unknown): ActionResult<never> {
  if (e instanceof UploadError) return fail(e.message, { file: e.message });
  return fail("Something went wrong. Please try again.");
}
