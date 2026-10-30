import type { Metadata } from "next";
import Link from "next/link";
import { type CSSProperties, Suspense } from "react";
import { ListToolbar } from "@/components/shared/ListToolbar";
import { EmptyState } from "@/components/shared/states";
import { PageHero, Photo, SitePagination, stagger } from "@/components/site/parts";
import { cached, TAG } from "@/lib/cache";
import { db } from "@/lib/db";
import { livePostWhere, stripExcerpt } from "@/lib/queries";
import { fmtDate, pageParam, POST_TYPES, strParam } from "@/lib/utils";

export const metadata: Metadata = { title: "News & Events", description: "Rescue reports, events, trainings and announcements from IRW Kerala.", alternates: { canonical: "/news-events" } };
const PAGE_SIZE = 6;

const getYears = cached("news-years", [TAG.posts], async () => {
  const rows = await db.post.findMany({ where: livePostWhere(), select: { publishedAt: true } });
  return [...new Set(rows.map((r) => r.publishedAt?.getFullYear()).filter((y): y is number => !!y))].sort((a, b) => b - a);
}, 600);

async function listPosts(search: string, type: string, year: string, requested: number) {
  const where = livePostWhere({
    ...(type ? { type } : {}),
    ...(year ? { publishedAt: { gte: new Date(`${year}-01-01`), lt: new Date(`${Number(year) + 1}-01-01`) } } : {}),
    ...(search ? { AND: [{ OR: [{ title: { contains: search } }, { excerpt: { contains: search } }, { tags: { contains: search } }] }] } : {}),
  });
  const total = await db.post.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requested, totalPages);
  const posts = await db.post.findMany({ where, orderBy: { publishedAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });
  return { total, totalPages, page, posts };
}
// Type, year and page have few values, so each combination is cached; free-text searches are not.
const listPostsCached = cached("news-list", [TAG.posts], (type: string, year: string, page: number) => listPosts("", type, year, page), 600);

export default async function NewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const search = strParam(sp.search).trim();
  const type = strParam(sp.type) in POST_TYPES ? strParam(sp.type) : "";
  const year = /^\d{4}$/.test(strParam(sp.year)) ? strParam(sp.year) : "";
  const requested = pageParam(sp.page);

  const [years, { total, totalPages, page, posts }] = await Promise.all([
    getYears(),
    search ? listPosts(search, type, year, requested) : listPostsCached(type, year, requested),
  ]);

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (type) params.type = type;
  if (year) params.year = year;

  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "News & Events" }]} title="News & Events" intro="Rescue reports, events, trainings and announcements from IRW Kerala." />
      <section className="mx-auto max-w-[1280px] px-4 sm:px-8">
        <div data-load style={{ "--d": "300ms" } as CSSProperties} className="surface -mt-8 overflow-visible rounded-2xl">
          <Suspense>
            <ListToolbar
              searchPlaceholder="Search news & events…"
              filters={[
                { key: "type", label: "Category", options: [{ value: "all", label: "All" }, ...Object.entries(POST_TYPES).map(([value, label]) => ({ value, label }))] },
                { key: "year", label: "Year", options: [{ value: "all", label: "All" }, ...years.map((y) => ({ value: String(y), label: String(y) }))] },
              ]}
            />
          </Suspense>
        </div>
      </section>
      <section className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 pb-24 pt-10 sm:px-8">
        <div className="text-sm text-body" aria-live="polite">
          {total === 0 ? "No results" : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(total, page * PAGE_SIZE)} of ${total} posts`}
        </div>
        {posts.length === 0 && (
          <div className="surface">
            <EmptyState title="No posts found" hint="Try a different search or clear the filters." clearHref="/news-events" />
          </div>
        )}
        {posts.map((p, i) => (
          <Link key={p.id} href={`/news-events/${p.slug}`} data-reveal style={stagger(i)} className="surface group flex flex-wrap overflow-clip transition-transform duration-150 active:scale-[0.995]">
            <div className="zoom min-h-[200px] flex-[1_1_300px]">
              <Photo src={p.coverUrl} label={POST_TYPES[p.type as keyof typeof POST_TYPES]} className="h-full min-h-[200px] w-full" />
            </div>
            <div className="flex min-w-0 flex-[999_1_480px] flex-col justify-center gap-3 px-8 py-7">
              <div className="flex items-center gap-2.5 text-[13px]">
                <span className="rounded-full bg-red-tint px-3 py-1 font-bold text-red-dark">{POST_TYPES[p.type as keyof typeof POST_TYPES]}</span>
                <time className="text-body">{fmtDate(p.publishedAt)}</time>
              </div>
              <h2 className="ml text-[22px] font-bold leading-snug transition-colors duration-200 group-hover:text-red">{p.title}</h2>
              {p.excerpt && <p className="text-base leading-relaxed text-body">{stripExcerpt(p.excerpt, 180)}</p>}
            </div>
          </Link>
        ))}
        <SitePagination page={page} totalPages={totalPages} basePath="/news-events" params={params} />
      </section>
    </>
  );
}
