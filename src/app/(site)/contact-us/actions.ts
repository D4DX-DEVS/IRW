"use server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { fail, zodFail, type ActionResult } from "@/lib/action";
import { inquirySchema } from "@/lib/validation";

const hits = new Map<string, number[]>();

export async function submitInquiry(input: unknown): Promise<ActionResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) return zodFail(parsed.error);
  const d = parsed.data;
  if (d.website) return { ok: true }; // honeypot: pretend success

  const ip = ((await headers()).get("x-forwarded-for") ?? "local").split(",")[0].trim();
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  if (recent.length >= 5) return fail("Too many messages from this connection. Please try again later.");
  hits.set(ip, [...recent, now]);

  await db.inquiry.create({
    data: { name: d.name, email: d.email, phone: d.phone, topic: d.topic, district: d.district, message: d.message },
  });
  await db.activity.create({ data: { actor: "Visitor", verb: `sent an inquiry · ${d.topic.charAt(0)}${d.topic.slice(1).toLowerCase()}`, kind: "inquiry" } });
  return { ok: true, message: "Thank you — we will get back to you soon." };
}
