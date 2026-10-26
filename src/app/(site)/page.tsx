import { ArrowRight, Phone } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { HeroBanners } from "@/components/site/HeroBanners";
import { Photo, stagger } from "@/components/site/parts";
import { db } from "@/lib/db";
import { livePostWhere, stripExcerpt } from "@/lib/queries";
import { getSettings } from "@/lib/settings";
import { fmtDate, POST_TYPES } from "@/lib/utils";

const FACTS = [
  ["1992", "Founded and registered as a non-governmental organisation"],
  ["4R", "Rescue, relief, rehabilitation and reconstruction"],
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

export default async function HomePage() {
  const [s, banners, news, feature, photos] = await Promise.all([
    getSettings(),
    db.banner.findMany({ where: { active: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }),
    db.post.findMany({ where: livePostWhere({ type: { in: ["NEWS", "EVENT", "REPORT"] } }), orderBy: { publishedAt: "desc" }, take: 3 }),
    db.post.findFirst({ where: livePostWhere({ type: "ACHIEVEMENT", featured: true }), orderBy: { publishedAt: "desc" } }),
    db.photo.findMany({ orderBy: [{ album: { sort: "asc" } }, { sort: "asc" }], take: 5 }),
  ]);
  const tel = `tel:${s.phone1.replace(/\s/g, "")}`;

  return (
    <>
      {banners.length > 0 ? (
        <HeroBanners banners={banners.map((b) => ({ id: b.id, title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref }))} />
      ) : (
        <section className="overflow-hidden bg-navy text-white">
          <div className="mx-auto grid max-w-[1280px] items-center gap-14 px-4 pb-24 pt-20 sm:px-8 lg:grid-cols-2">
            <div className="flex flex-col gap-7">
              <h1 className="lines text-[clamp(44px,5.4vw,76px)] font-extrabold leading-[1.02] tracking-tight">
                <span className="line"><span data-line>Trained hands, the moment</span></span>
                <span className="line"><span data-line style={stagger(1)}>disaster strikes.</span></span>
              </h1>
              <p data-load className="max-w-[540px] text-[19px] leading-relaxed text-white">
                Ideal Relief Wing Kerala deploys skilled volunteer rescuers, medics and para-medics across floods, landslides, earthquakes, epidemics and social unrest — from rescue to reconstruction.
              </p>
              <div data-load style={{ "--d": "480ms" } as CSSProperties} className="flex flex-wrap gap-3.5">
                <Link href="/contact-us" className="btn btn-red nudge !min-h-[52px] !px-6 !text-base">
                  Support our work <ArrowRight size={18} />
                </Link>
                <a href={tel} className="btn !min-h-[52px] bg-white/10 !px-6 !text-base text-white hover:bg-white/20">
                  <Phone size={18} /> Emergency: {s.phone1}
                </a>
              </div>
            </div>
            <div className="grid grid-cols-2 grid-rows-[220px_180px] gap-3">
              {photos.slice(0, 3).map((p, i) => (
                <div key={p.id} data-reveal="scale" style={stagger(i)} className={`zoom rounded-2xl ${i === 0 ? "col-span-2" : ""}`}>
                  <Photo src={p.url} alt={p.caption} className="h-full w-full" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Facts: each figure rises in turn while its red rule draws down. */}
      <section aria-label="IRW at a glance" className="bg-white">
        <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-12 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {FACTS.map(([v, l], i) => (
            <div key={v} data-reveal style={stagger(i)} className="relative flex flex-col gap-1.5 pl-5">
              <span data-draw="y" style={stagger(i)} className="absolute inset-y-0 left-0 w-[3px] rounded-full bg-red" aria-hidden="true" />
              <div className="text-[34px] font-extrabold tracking-tight">{v}</div>
              <div className="text-base leading-snug text-body">{l}</div>
            </div>
          ))}
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
        <ol className="flex flex-col gap-3">
          {STAGES.map(([t, b], i) => (
            <li
              key={t}
              data-reveal
              style={stagger(i)}
              className="group relative overflow-clip rounded-[20px] bg-white px-7 py-8 transition-[background-color,color] duration-300 hover:bg-navy hover:text-white sm:px-10"
            >
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 origin-top scale-y-0 bg-red transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:scale-y-100" />
              <h3 className="text-[clamp(24px,2.4vw,32px)] font-extrabold tracking-tight transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-2">{t}</h3>
              <p className="mt-2 max-w-xl text-[17px] leading-relaxed text-body transition-colors duration-300 group-hover:text-[#dbe4f2]">{b}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Track record: the axis draws across, then each year drops onto it. */}
      <section className="mx-auto max-w-[1280px] px-4 py-16 sm:px-8">
        <div data-reveal="fade" className="flex flex-col gap-10 rounded-[28px] bg-navy p-8 text-white sm:p-14">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <h2 data-reveal className="max-w-xl text-[clamp(28px,3.4vw,42px)] font-extrabold leading-[1.1] tracking-tight">Inside Kerala and far beyond it.</h2>
            <p data-reveal style={stagger(1)} className="max-w-md text-[17px] leading-relaxed text-[#dbe4f2]">Deployments appreciated by authorities and media, across three decades.</p>
          </div>
          <ol className="relative grid grid-cols-2 sm:grid-cols-4">
            <span data-draw className="absolute inset-x-0 top-0 h-0.5 bg-white/30" aria-hidden="true" />
            {TIMELINE.map(([y, e], i) => (
              <li key={y} data-reveal style={stagger(i)} className="relative flex flex-col gap-2 pb-2 pr-4 pt-6">
                <span className="absolute -top-[5px] left-0 h-3 w-3 rounded-full bg-[#ff4d5e]" aria-hidden="true" />
                <div className="text-[28px] font-extrabold">{y}</div>
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
          <div className="mx-auto max-w-[1280px] px-4 py-24 sm:px-8">
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
        <section className="mx-auto grid max-w-[1280px] items-center gap-14 px-4 py-24 sm:px-8 lg:grid-cols-2">
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

      <section className="mx-auto max-w-[1280px] px-4 pb-24 sm:px-8">
        <div data-reveal="scale" className="flex flex-wrap items-center justify-between gap-8 rounded-[28px] bg-red p-8 text-white sm:p-14">
          <div className="flex max-w-xl flex-col gap-3.5">
            <h2 data-reveal style={stagger(1)} className="text-[clamp(28px,3.4vw,40px)] font-extrabold leading-[1.1] tracking-tight">Stand with the people who show up first.</h2>
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
