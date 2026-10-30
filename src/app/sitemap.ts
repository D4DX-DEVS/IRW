import type { MetadataRoute } from "next";
import { getLiveSlugs } from "@/lib/queries";
import { siteUrl } from "@/lib/seo";

// Rendered per request so SITE_URL comes from the Worker's runtime vars; the post list is cached.
export const dynamic = "force-dynamic";

const PAGES: [path: string, priority: number, changeFrequency: "daily" | "weekly" | "monthly"][] = [
  ["", 1, "daily"],
  ["/news-events", 0.9, "daily"],
  ["/about-us", 0.8, "monthly"],
  ["/contact-us", 0.8, "monthly"],
  ["/our-team", 0.6, "monthly"],
  ["/articles", 0.6, "monthly"],
  ["/publications", 0.6, "monthly"],
  ["/images", 0.5, "weekly"],
  ["/video", 0.5, "weekly"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const posts = await getLiveSlugs();
  const latest = posts.reduce<Date | undefined>((d, p) => (!d || p.updatedAt > d ? p.updatedAt : d), undefined);
  return [
    ...PAGES.map(([p, priority, changeFrequency]) => ({ url: `${base}${p}`, lastModified: p === "" || p === "/news-events" ? latest : undefined, priority, changeFrequency })),
    ...posts.map((p) => ({ url: `${base}/news-events/${encodeURIComponent(p.slug)}`, lastModified: p.updatedAt, priority: 0.7, changeFrequency: "monthly" as const })),
  ];
}
