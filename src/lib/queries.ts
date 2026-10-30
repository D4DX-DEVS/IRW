import type { Prisma } from "@prisma/client";
import { cached, TAG } from "./cache";
import { db } from "./db";

/** Posts visible on the public site: not trashed, published, or scheduled with a date in the past. */
export function livePostWhere(extra: Prisma.PostWhereInput = {}): Prisma.PostWhereInput {
  return {
    deletedAt: null,
    OR: [{ status: "PUBLISHED" }, { status: "SCHEDULED", publishedAt: { lte: new Date() } }],
    ...extra,
  };
}

/** Slug and last edit of every live post, for the sitemap and to turn away unknown post URLs. */
export const getLiveSlugs = cached("live-slugs", [TAG.posts], () => db.post.findMany({ where: livePostWhere(), select: { slug: true, updatedAt: true } }), 600);

export const tagList = (tags: string) => tags.split(",").map((t) => t.trim()).filter(Boolean);

export const stripExcerpt = (s: string, n = 160) => (s.length > n ? `${s.slice(0, n).trim()}…` : s);
