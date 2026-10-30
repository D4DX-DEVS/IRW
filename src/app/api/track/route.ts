import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { path, sid } = (await req.json()) as { path?: unknown; sid?: unknown };
    if (typeof path !== "string" || typeof sid !== "string") return new Response(null, { status: 204 });
    // only same-site relative paths; rejects javascript:, //host, \host etc.
    if (!/^\/(?![\/\\])/.test(path) || path.startsWith("/admin") || path.length > 200 || sid.length > 64) return new Response(null, { status: 204 });
    await db.pageView.create({ data: { path, sessionId: sid } });
    // Post pages are served from the cache, so their view count is kept here.
    const post = /^\/news-events\/([^/?#]+)$/.exec(path);
    if (post) await db.post.updateMany({ where: { slug: decodeURIComponent(post[1]) }, data: { views: { increment: 1 } } });
  } catch {
    // tracking must never break the page
  }
  return new Response(null, { status: 204 });
}
