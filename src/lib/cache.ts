import "server-only";
import { unstable_cache } from "next/cache";

/**
 * One tag per kind of public content. Every cached read names the tags it depends on, and the
 * admin action that changes that content calls refreshSite(tag), so only the pages built from it
 * are rebuilt (the tags of a cached read are attached to the page that used it).
 */
export const TAG = {
  settings: "settings",
  banners: "banners",
  posts: "posts",
  team: "team",
  gallery: "gallery",
  videos: "videos",
  publications: "publications",
} as const;
export type CacheTag = (typeof TAG)[keyof typeof TAG];

// unstable_cache stores results as JSON, which would turn Prisma's Date fields into strings.
// Encode dates explicitly and revive them on the way out.
function encode(value: unknown): string {
  return JSON.stringify(value, function (this: Record<string, unknown>, key, v) {
    const raw = this[key];
    return raw instanceof Date ? { $date: raw.getTime() } : v;
  });
}
function decode<T>(s: string): T {
  return JSON.parse(s, (_, v) => (v && typeof v === "object" && typeof v.$date === "number" && Object.keys(v).length === 1 ? new Date(v.$date) : v));
}

/**
 * Caches a public read across requests and deploys until one of its tags is refreshed, or at the
 * latest after `revalidate` seconds (a safety net for writes made outside the admin, e.g. scripts).
 * Arguments are part of the cache key, so pass only plain serialisable values.
 */
export function cached<A extends unknown[], R>(key: string, tags: CacheTag[], fn: (...args: A) => Promise<R>, revalidate = 3600): (...args: A) => Promise<R> {
  const store = unstable_cache(async (...args: A) => encode(await fn(...args)), [key], { tags, revalidate });
  return async (...args: A) => decode<R>(await store(...args));
}
