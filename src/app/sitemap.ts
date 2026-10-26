import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { livePostWhere } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3111";
  const posts = await db.post.findMany({ where: livePostWhere(), select: { slug: true, updatedAt: true } });
  const pages = ["", "/about-us", "/our-team", "/articles", "/images", "/video", "/news-events", "/publications", "/contact-us"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, lastModified: new Date() })),
    ...posts.map((p) => ({ url: `${base}/news-events/${p.slug}`, lastModified: p.updatedAt })),
  ];
}
