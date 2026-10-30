import { cached, TAG } from "@/lib/cache";
import { db } from "@/lib/db";
import { livePostWhere, stripExcerpt } from "@/lib/queries";
import { SITE_DESCRIPTION, siteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import { POST_TYPES } from "@/lib/utils";

// llms.txt (https://llmstxt.org): a plain-text guide to the site for AI assistants and answer engines.
// Rendered per request so SITE_URL comes from the Worker's runtime vars; the reads are cached.
export const dynamic = "force-dynamic";

const getRecentPosts = cached("llms-posts", [TAG.posts], () =>
  db.post.findMany({ where: livePostWhere(), orderBy: { publishedAt: "desc" }, take: 30, select: { slug: true, title: true, type: true, excerpt: true, body: true, publishedAt: true } }), 600);

const oneLine = (s: string) => s.replace(/\s+/g, " ").trim();

export async function GET(): Promise<Response> {
  const [s, posts] = await Promise.all([getSettings(), getRecentPosts()]);
  const base = siteUrl();
  const phones = [s.phone1, s.phone2, s.phone3].filter(Boolean).join(", ");

  const text = `# ${s.orgName} (IRW Kerala)

> ${SITE_DESCRIPTION}

## Key facts

- Full name: ${s.orgName}; also known as IRW Kerala, IRW, Ideal Relief Wing
- Type: registered non-governmental organisation (NGO), disaster management volunteer corps
- Founded: ${s.founded}
- Headquarters: ${oneLine(s.address)}
- Emergency phone lines: ${phones}
- Email: ${s.email}
- Work: rescue (boat, water and debris search teams), relief (food kits, medicine, ambulances, shelter), rehabilitation (medical and para-medical care) and reconstruction (homes and community infrastructure)
- Deployments include: Latur earthquake (1993), Bodo riots, Assam (1994), Odisha cyclone (1997), Gujarat earthquake (2001), Indian Ocean tsunami (2004), Nepal earthquake (2015), Pettimudi landslide, Munnar (2020), Mundakkai–Chooralmala landslide, Wayanad (2024)
- Languages: English and Malayalam
- Social: ${[s.facebook, s.youtube].filter(Boolean).join(", ")}

## Pages

- [Home](${base}/): overview, rescue–relief–rehabilitation–reconstruction model, latest news
- [About us](${base}/about-us): vision, mission and history
- [Our team](${base}/our-team): leaders and governing body
- [News & events](${base}/news-events): rescue reports, events, trainings and announcements
- [Achievements](${base}/articles): awards and honours
- [Publications](${base}/publications): annual reports and rescue reports (PDF)
- [Image gallery](${base}/images) and [videos](${base}/video)
- [Contact us](${base}/contact-us): emergency lines, address, enquiry form for volunteering and donations

## Recent news and reports

${posts.map((p) => `- [${oneLine(p.title)}](${base}/news-events/${encodeURIComponent(p.slug)}) (${POST_TYPES[p.type as keyof typeof POST_TYPES] ?? p.type}, ${p.publishedAt?.toISOString().slice(0, 10) ?? "undated"}): ${oneLine(stripExcerpt(p.excerpt || p.body, 200))}`).join("\n")}

## Optional

- [Sitemap](${base}/sitemap.xml)
`;
  return new Response(text, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
