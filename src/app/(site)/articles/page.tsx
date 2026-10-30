import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageHero, Photo, SitePagination, stagger } from "@/components/site/parts";
import { cached, TAG } from "@/lib/cache";
import { db } from "@/lib/db";
import { livePostWhere, stripExcerpt } from "@/lib/queries";
import { fmtDate, pageParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Achievements", description: "Awards, honours and words of thanks received by IRW Kerala.", alternates: { canonical: "/articles" } };
const PAGE_SIZE = 6;

// One cache entry per page number; ?page makes the route dynamic, so the queries carry the cache.
const getPage = cached("achievements", [TAG.posts], async (requested: number) => {
  const where = livePostWhere({ type: "ACHIEVEMENT" });
  const total = await db.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const posts = await db.post.findMany({ where, orderBy: [{ featured: "desc" }, { publishedAt: "desc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });
  return { page, total, totalPages, posts };
}, 600);

export default async function AchievementsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const { page, total, totalPages, posts } = await getPage(pageParam(sp.page));
  const lead = page === 1 ? posts[0] : undefined;
  const rest = page === 1 ? posts.slice(1) : posts;

  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Achievements" }]} title="Achievements" intro="Honours, awards and words of thanks from the communities and authorities IRW has served." />
      <section className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 pb-24 pt-16 sm:px-8">
        {total === 0 && <p className="surface p-10 text-center text-body">No achievements published yet.</p>}
        {lead && (
          <article data-reveal className="surface group grid overflow-clip rounded-3xl md:grid-cols-2">
            <div data-shutter className="zoom min-h-[300px]">
              <Photo src={lead.coverUrl} label="Featured" className="h-full min-h-[300px] w-full bg-red-dark" />
            </div>
            <div className="flex flex-col justify-center gap-4 p-8 sm:p-11">
              <div className="flex items-center gap-2.5 text-[13px]">
                <span className="rounded-full bg-red px-3 py-1 font-bold text-white">Featured</span>
                <time className="text-body">{fmtDate(lead.publishedAt)}</time>
              </div>
              <h2 className="ml text-[28px] font-bold leading-snug">{lead.title}</h2>
              <p className="ml line-clamp-4 leading-8 text-body">{stripExcerpt(lead.excerpt || lead.body, 260)}</p>
              <Link href={`/news-events/${lead.slug}`} className="nudge inline-flex items-center gap-1.5 self-start text-[15px] font-bold text-red"><span className="link-draw">Read full story</span> <ArrowRight size={16} /></Link>
            </div>
          </article>
        )}
        <div className="grid gap-6 md:grid-cols-2">
          {rest.map((p, i) => (
            <article key={p.id} data-reveal style={stagger(i)} className="surface group flex flex-col overflow-clip">
              <div className="zoom h-[220px]">
                <Photo src={p.coverUrl} label="Achievement" className="h-full w-full" />
              </div>
              <div className="flex flex-col gap-3.5 p-7">
                <time className="text-sm text-body">{fmtDate(p.publishedAt)}</time>
                <h3 className="ml text-xl font-bold leading-snug">{p.title}</h3>
                <p className="ml line-clamp-3 leading-8 text-body">{stripExcerpt(p.excerpt || p.body, 200)}</p>
                <Link href={`/news-events/${p.slug}`} className="nudge inline-flex items-center gap-1.5 self-start text-[15px] font-bold text-red"><span className="link-draw">Read more</span> <ArrowRight size={16} /></Link>
              </div>
            </article>
          ))}
        </div>
        <SitePagination page={page} totalPages={totalPages} basePath="/articles" />
      </section>
    </>
  );
}
