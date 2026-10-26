import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { path, sid } = (await req.json()) as { path?: unknown; sid?: unknown };
    if (typeof path !== "string" || typeof sid !== "string") return new Response(null, { status: 204 });
    if (path.startsWith("/admin") || path.length > 200 || sid.length > 64) return new Response(null, { status: 204 });
    await db.pageView.create({ data: { path, sessionId: sid } });
  } catch {
    // tracking must never break the page
  }
  return new Response(null, { status: 204 });
}
