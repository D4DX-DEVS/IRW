import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Body, Photo, stagger } from "@/components/site/parts";
import { db } from "@/lib/db";
import { livePostWhere, stripExcerpt, tagList } from "@/lib/queries";
import { fmtDate, POST_TYPES } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  return db.post.findFirst({ where: livePostWhere({ slug: decodeURIComponent(slug) }) });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await load((await params).slug);
  if (!p) return { title: "Not found" };
  const description = stripExcerpt(p.excerpt || p.body, 160);
  return { title: p.title, description, openGraph: { title: p.title, description, images: p.coverUrl ? [p.coverUrl] : undefined, type: "article" } };
}

export default async function PostPage({ params }: Props) {
  const post = await load((await params).slug);
  if (!post) notFound();
  await db.post.update({ where: { id: post.id }, data: { views: { increment: 1 } } });
  const related = await db.post.findMany({ where: livePostWhere({ type: post.type, NOT: { id: post.id } }), orderBy: { publishedAt: "desc" }, take: 3 });
  const label = POST_TYPES[post.type as keyof typeof POST_TYPES];
  const mins = Math.max(1, Math.round(post.body.split(/\s+/).length / 200));

  return (
    <>
      <article>
        <div className="mx-auto flex max-w-[880px] flex-col gap-5 px-4 pb-20 pt-12 sm:px-8">
          <div className="surface overflow-clip rounded-[22px]">
            <header className="flex flex-col gap-4 px-7 pb-7 pt-8 sm:px-11 sm:pt-10">
              <div className="flex flex-wrap items-center gap-2.5 text-sm">
                <span className="rounded-full bg-red-tint px-3 py-1 font-bold text-red-dark">{label}</span>
                <time className="text-muted">{fmtDate(post.publishedAt, { day: "numeric", month: "long", year: "numeric" })}</time>
                <span className="text-muted">· {mins} min read</span>
              </div>
              <h1 className="ml text-[clamp(24px,3.2vw,36px)] font-bold leading-[1.45]">{post.title}</h1>
            </header>
            {post.coverUrl && (
              <div data-shutter>
                <Photo src={post.coverUrl} alt={post.title} label="Cover photo" className="h-auto max-h-[760px] w-full" />
              </div>
            )}
            <div className="p-7 sm:p-11">
              <Body text={post.body || post.excerpt} />
              {tagList(post.tags).length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2">
                  {tagList(post.tags).map((t) => (
                    <Link key={t} href={`/news-events?search=${encodeURIComponent(t)}`} className="rounded-full bg-bg2 px-3 py-1.5 text-sm font-semibold text-royal transition-[background-color,color,transform] duration-200 hover:bg-royal hover:text-white active:scale-95">#{t}</Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-white">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 pb-24 pt-16 sm:px-8">
            <div className="flex items-end justify-between">
              <h2 data-reveal className="text-[32px] font-extrabold">Related posts</h2>
              <Link href="/news-events" className="font-bold text-red"><span className="link-draw">All news</span> →</Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((r, i) => (
                <Link key={r.id} href={`/news-events/${r.slug}`} data-reveal style={stagger(i)} className="group flex flex-col gap-3.5">
                  <div className="zoom h-[190px] rounded-2xl">
                    <Photo src={r.coverUrl} label="News" className="h-full w-full" />
                  </div>
                  <span className="text-sm text-body">{label} · {fmtDate(r.publishedAt)}</span>
                  <h3 className="ml text-[19px] font-bold leading-snug transition-colors duration-200 group-hover:text-red">{r.title}</h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
