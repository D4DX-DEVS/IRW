import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Body, Photo, stagger } from "@/components/site/parts";
import { cached, TAG } from "@/lib/cache";
import { db } from "@/lib/db";
import { getLiveSlugs, livePostWhere, stripExcerpt, tagList } from "@/lib/queries";
import { articleLd, breadcrumbLd, jsonLd } from "@/lib/seo";
import { fmtDate, POST_TYPES } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

// Each post is rendered on its first visit and then served from the cache until posts change.
// Views are counted by the page tracker (/api/track), not here, so the cached page stays valid.
export const revalidate = 3600;
export function generateStaticParams() {
  return [];
}

const getPost = cached("post", [TAG.posts], async (slug: string) => {
  const post = await db.post.findFirst({ where: livePostWhere({ slug }) });
  if (!post) return null;
  const related = await db.post.findMany({ where: livePostWhere({ type: post.type, NOT: { id: post.id } }), orderBy: { publishedAt: "desc" }, take: 3 });
  return { post, related };
}, 600);

async function load(slug: string) {
  let s = slug;
  try {
    s = decodeURIComponent(slug);
  } catch {
    return null;
  }
  // Unknown slugs never reach the cache, so random URLs cannot fill it.
  return (await getLiveSlugs()).some((p) => p.slug === s) ? getPost(s) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = (await load((await params).slug))?.post;
  if (!p) return { title: "Not found" };
  const description = stripExcerpt(p.excerpt || p.body, 160);
  return {
    title: p.title,
    description,
    alternates: { canonical: `/news-events/${p.slug}` },
    openGraph: { title: p.title, description, url: `/news-events/${p.slug}`, images: p.coverUrl ? [p.coverUrl] : undefined, type: "article", publishedTime: p.publishedAt?.toISOString(), modifiedTime: p.updatedAt.toISOString(), tags: tagList(p.tags) },
  };
}

export default async function PostPage({ params }: Props) {
  const data = await load((await params).slug);
  if (!data) notFound();
  const { post, related } = data;
  const label = POST_TYPES[post.type as keyof typeof POST_TYPES];
  const mins = Math.max(1, Math.round(post.body.split(/\s+/).length / 200));

  const ld = jsonLd(
    articleLd({ title: post.title, slug: post.slug, description: stripExcerpt(post.excerpt || post.body, 160), image: post.coverUrl, publishedAt: post.publishedAt, updatedAt: post.updatedAt, authorName: post.authorName, tags: tagList(post.tags) }),
    breadcrumbLd([{ name: "Home", path: "/" }, { name: "News & Events", path: "/news-events" }, { name: post.title, path: `/news-events/${post.slug}` }]),
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ld }} />
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
