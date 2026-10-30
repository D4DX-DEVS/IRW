import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroBanners } from "@/components/site/HeroBanners";
import { Photo, stagger } from "@/components/site/parts";
import { cached, TAG } from "@/lib/cache";
import { db } from "@/lib/db";
import { livePostWhere, stripExcerpt } from "@/lib/queries";
import { fmtDate, POST_TYPES } from "@/lib/utils";

const FACTS = [
  ["1992", "Founded and registered as a non-governmental organisation"],
  ["Statewide", "Trained volunteer network across Kerala"],
  ["24 × 7", "Rapid enquiry and emergency response lines"],
];
const STAGES = [
  ["Rescue", "Boat, water and debris search teams trained to act quickly in floods, landslides and accidents."],
  ["Relief", "Food kits, medicine, ambulances and shelter support for families cut off by a calamity."],
  ["Rehabilitation", "Medical practitioners and para-medics helping the affected return to normal life."],
  ["Reconstruction", "Rebuilding homes and community infrastructure after the emergency phase ends."],
];
const TIMELINE = [
  ["1993", "Latur earthquake"], ["1994", "Bodo riots, Assam"], ["1997", "Odisha cyclone"], ["2001", "Gujarat earthquake"],
  ["2004", "Indian Ocean tsunami"], ["2015", "Nepal earthquake"], ["2020", "Pettimudi landslide, Munnar"], ["2024", "Mundakkai–Chooralmala landslide"],
];

export const metadata: Metadata = { alternates: { canonical: "/" } };

// Rebuilt when banners, posts or the gallery change; every 10 minutes at most so scheduled posts go live.
export const revalidate = 600;

const getHome = cached("home", [TAG.banners, TAG.posts, TAG.gallery], () =>
  Promise.all([
    db.banner.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }),
    db.post.findMany({ where: livePostWhere({ type: { in: ["NEWS", "EVENT", "REPORT"] } }), orderBy: { publishedAt: "desc" }, take: 3 }),
    db.post.findFirst({ where: livePostWhere({ type: "ACHIEVEMENT", featured: true }), orderBy: { publishedAt: "desc" } }),
    db.photo.findMany({ orderBy: [{ album: { sort: "asc" } }, { sort: "asc" }], take: 5 }),
  ]), 600);

export default async function HomePage() {
  const [banners, news, feature, photos] = await getHome();

  return (
    <>
      {banners.length > 0 && (
        <HeroBanners banners={banners.map((b) => ({ id: b.id, title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref }))} />
      )}

      {/* Intro: the banners are artwork only, so the page's title, actions and figures live here, painted on the first frame. */}
      <section className="bg-navy text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 pb-16 pt-12 sm:px-8 lg:gap-14 lg:pb-24 lg:pt-20">
          <h1 className="max-w-[16ch] text-[clamp(34px,6vw,84px)] font-extrabold leading-[1.02] tracking-[-0.03em]">Trained hands when disaster strikes.</h1>
          <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:gap-16">
            <div className="flex flex-col gap-7">
              <p className="max-w-[540px] text-lg leading-relaxed text-white">
                Ideal Relief Wing Kerala deploys skilled volunteer rescuers, medics and para-medics across floods, landslides, earthquakes, epidemics and social unrest, from rescue to reconstruction.
              </p>
              {/* The emergency number already sits in the bar above, so one action here. */}
              <Link href="/contact-us" className="btn btn-red nudge self-start !min-h-[52px] !px-6 !text-base">
                Support our work <ArrowRight size={18} />
              </Link>
            </div>
            {/* Each figure rises in turn while its red rule draws down. */}
            <dl className="grid gap-x-8 gap-y-8 sm:grid-cols-3">
              {FACTS.map(([v, l], i) => (
                <div key={v} data-reveal style={stagger(i)} className="relative flex flex-col gap-2 pl-5">
                  <span data-draw="y" style={stagger(i)} className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-red" aria-hidden="true" />
                  <dt className="text-[clamp(28px,2.6vw,36px)] font-extrabold tracking-tight">{v}</dt>
                  <dd className="text-base leading-snug text-[#dbe4f2]">{l}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* What we do: the heading holds while the four stages pass, in the order they happen. */}
      <section className="mx-auto grid max-w-[1280px] items-start gap-10 px-4 pb-16 pt-28 sm:px-8 lg:grid-cols-[5fr_7fr] lg:gap-16">
        <div className="flex flex-col gap-6 lg:sticky lg:top-32">
          <h2 data-reveal className="text-[clamp(30px,3.6vw,46px)] font-extrabold leading-[1.08] tracking-tight">Four stages, one trained team.</h2>
          <p data-reveal style={stagger(1)} className="max-w-md text-lg leading-relaxed text-body">
            Every IRW volunteer trains for the whole arc of a disaster, from the first search to the last rebuilt wall.
          </p>
          <Link data-reveal style={stagger(2)} href="/about-us" className="nudge inline-flex items-center gap-2 self-start font-bold text-red">
            <span className="link-draw">About IRW</span> <ArrowRight size={16} />
          </Link>
        </div>
        {/* One card per stage, in the order they happen; the red rule along the top draws in on hover. */}
        <ol className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {STAGES.map(([t, b], i) => (
            <li
              key={t}
              data-reveal
              style={stagger(i)}
              className="surface group relative flex h-full flex-col gap-3 overflow-clip p-6 transition-transform duration-300 [transition-timing-function:var(--ease-out)] hover:-translate-y-1 sm:p-7"
            >
              <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-red transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:scale-x-100" />
              <span className="text-sm font-bold text-red">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-xl font-bold tracking-tight">{t}</h3>
              <p className="text-base leading-relaxed text-body">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Track record: the axis draws across, then each year drops onto it. */}
      <section className="mt-16 bg-navy text-white">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-12 px-4 py-20 sm:px-8 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 data-reveal className="max-w-xl text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-tight">Inside Kerala and far beyond it.</h2>
            <p data-reveal style={stagger(1)} className="max-w-md text-[17px] leading-relaxed text-[#dbe4f2]">Deployments appreciated by authorities and media, across three decades.</p>
          </div>
          <ol className="relative grid grid-cols-2 sm:grid-cols-4">
            <span data-draw className="absolute inset-x-0 top-0 h-0.5 bg-white/30" aria-hidden="true" />
            {TIMELINE.map(([y, e], i) => (
              <li key={y} data-reveal style={stagger(i)} className="relative flex flex-col gap-2 pb-2 pr-4 pt-6">
                <span className="absolute -top-[5px] left-0 h-3 w-3 rounded-full bg-[#ff4d5e]" aria-hidden="true" />
                <div className="text-[clamp(28px,3vw,40px)] font-extrabold tracking-tight">{y}</div>
                <div className="text-[15px] leading-snug text-[#dbe4f2]">{e}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-16 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
          <h2 data-reveal className="text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight">News from the field</h2>
          <Link data-reveal style={stagger(1)} href="/news-events" className="nudge inline-flex items-center gap-2 font-bold text-red">
            <span className="link-draw">All news</span> <ArrowRight size={16} />
          </Link>
        </div>
        {news.length === 0 ? (
          <p className="surface p-8 text-body">No news published yet.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {news.map((n, i) => (
              <Link
                key={n.id}
                href={`/news-events/${n.slug}`}
                data-reveal
                style={stagger(i)}
                className="surface group flex flex-col overflow-clip transition-transform duration-150 active:scale-[0.99]"
              >
                <div className="zoom h-[220px]">
                  <Photo src={n.coverUrl} alt="" label={POST_TYPES[n.type as keyof typeof POST_TYPES]} className="h-full w-full" />
                </div>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex items-center gap-2.5 text-sm text-body">
                    <span className="rounded-full bg-red-tint px-2.5 py-1 font-bold text-red-dark">{POST_TYPES[n.type as keyof typeof POST_TYPES]}</span>
                    <time>{fmtDate(n.publishedAt)}</time>
                  </div>
                  <h3 className="ml line-clamp-3 text-[19px] font-bold leading-snug transition-colors duration-200 group-hover:text-red">{n.title}</h3>
                  {n.excerpt && <p className="line-clamp-3 text-base leading-relaxed text-body">{stripExcerpt(n.excerpt, 110)}</p>}
                  <span className="nudge mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-bold text-red">
                    Read more <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {photos.length >= 5 && (
        <section className="bg-white">
          <div className="mx-auto max-w-[1280px] px-4 py-16 sm:px-8 lg:py-24">
            <div className="mb-10 flex flex-wrap items-end justify-between gap-5">
              <h2 data-reveal className="text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight">Volunteers at work</h2>
              <Link data-reveal style={stagger(1)} href="/images" className="nudge inline-flex items-center gap-2 font-bold text-red">
                <span className="link-draw">Open the gallery</span> <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 [grid-auto-rows:160px] sm:[grid-auto-rows:200px] lg:grid-cols-4">
              {photos.map((p, i) => (
                <Link
                  key={p.id}
                  href="/images"
                  data-reveal="scale"
                  style={stagger(i)}
                  aria-label={p.caption ? `Gallery: ${p.caption}` : "Open the gallery"}
                  className={`zoom group rounded-2xl ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                >
                  <Photo src={p.url} alt={p.caption} className="h-full w-full" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {feature && (
        <section className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-2 lg:gap-14 lg:py-24">
          <div data-shutter className="overflow-clip rounded-3xl">
            <Photo src={feature.coverUrl} label="Achievement" className="h-[420px] w-full" />
          </div>
          <div className="flex flex-col gap-5">
            <h2 data-reveal className="text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-tight">Honoured for the work</h2>
            <h3 data-reveal style={stagger(1)} className="ml text-[clamp(22px,2.2vw,28px)] font-bold leading-snug">{feature.title}</h3>
            <p data-reveal style={stagger(2)} className="ml text-[17px] leading-8 text-body">{stripExcerpt(feature.excerpt || feature.body, 260)}</p>
            <div data-reveal style={stagger(3)} className="flex flex-wrap gap-3.5">
              <Link href={`/news-events/${feature.slug}`} className="btn btn-navy nudge">Read the story <ArrowRight size={16} /></Link>
              <Link href="/articles" className="btn bg-white text-navy hover:bg-tint">All achievements</Link>
            </div>
          </div>
        </section>
      )}

      <section className="bg-red text-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-6 px-4 py-14 sm:gap-8 sm:px-8 sm:py-20 lg:py-24">
          <div className="flex max-w-xl flex-col gap-3.5">
            <h2 data-reveal style={stagger(1)} className="text-[clamp(28px,3.4vw,46px)] font-extrabold leading-[1.05] tracking-tight">Stand with the first responders.</h2>
            <p data-reveal style={stagger(2)} className="text-[17px] leading-relaxed text-white">Volunteer for training, or support rescue equipment, boats and relief kits.</p>
          </div>
          <div data-reveal style={stagger(3)} className="flex flex-wrap gap-3.5">
            <Link href="/contact-us?topic=VOLUNTEER" className="btn nudge !min-h-[52px] bg-white !px-6 !font-extrabold text-red-dark hover:bg-red-tint">Become a volunteer <ArrowRight size={16} /></Link>
            <Link href="/contact-us?topic=DONATION" className="btn !min-h-[52px] bg-white/15 !px-6 text-white hover:bg-white/25">Donate</Link>
          </div>
        </div>
      </section>
    </>
  );
}
