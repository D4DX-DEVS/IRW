import type { Metadata } from "next";
import { PageHero, Photo, stagger } from "@/components/site/parts";
import { cached, TAG } from "@/lib/cache";
import { db } from "@/lib/db";

export const metadata: Metadata = { title: "About Us", description: "Vision, mission and history of Ideal Relief Wing Kerala, a registered NGO established in 1992.", alternates: { canonical: "/about-us" } };

const VALUES = ["Teamwork", "Value addition", "Integrity", "Accountability", "Transparency"];
const DEPLOYS = [
  ["1993", "Latur earthquake", "Maharashtra"],
  ["1994", "Bodo riots", "Assam"],
  ["1997", "Cyclone", "Odisha"],
  ["2001", "Earthquake", "Gujarat"],
  ["2004", "Tsunami", "Kerala coast"],
  ["2015", "Earthquake", "Nepal"],
];

export const revalidate = 3600;

const getPhotos = cached("about-photos", [TAG.gallery], () => db.photo.findMany({ orderBy: [{ album: { sort: "asc" } }, { sort: "asc" }], skip: 5, take: 4 }));

export default async function AboutPage() {
  const photos = await getPhotos();
  const [hero, ...more] = photos;

  return (
    <>
      <PageHero
        crumbs={[{ href: "/", label: "Home" }, { label: "About Us" }]}
        title="About Ideal Relief Wing"
        intro="Based in Kerala, IRW has built an organised team of skilled male and female rescuers, medical practitioners, para-medics and volunteers — ready at any hour."
        image={hero ? { src: hero.url, alt: hero.caption || "IRW volunteers in the field" } : undefined}
      />

      <section className="mx-auto max-w-[1280px] px-4 pt-16 sm:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <div data-reveal className="surface flex flex-col gap-4 p-8 sm:p-10">
            <h2 className="text-[26px] font-extrabold">Our vision</h2>
            <p className="text-lg leading-relaxed text-body">To serve the created as assigned by the Creator. Skilled volunteering services at calamities and mishaps since its inception.</p>
          </div>
          <div data-reveal style={stagger(1)} className="flex flex-col gap-4 rounded-[20px] bg-navy p-8 text-white sm:p-10">
            <h2 className="text-[26px] font-extrabold">Our mission</h2>
            <p className="text-lg leading-relaxed text-[#e6ecf5]">Extend systematic, skilled and dedicated volunteering service to the needy at times of natural and man-made calamities to ensure effective Rescue, Rehabilitation and Reconstruction.</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-10 pt-24 sm:px-8">
        <h2 data-reveal className="mb-9 text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight">What every volunteer carries</h2>
        <ul className="flex flex-wrap gap-3">
          {VALUES.map((v, i) => (
            <li
              key={v}
              data-reveal="scale"
              style={stagger(i)}
              className="rounded-full bg-white px-7 py-4 text-[clamp(20px,2vw,26px)] font-bold transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 hover:bg-red hover:text-white"
            >
              {v}
            </li>
          ))}
        </ul>
      </section>

      <section className="mx-auto grid max-w-[1280px] items-start gap-16 px-4 py-16 sm:px-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5 text-[17px] leading-[1.75] text-body">
          <h2 data-reveal className="text-[clamp(26px,3vw,40px)] font-extrabold leading-[1.1] tracking-tight text-navy">Rescue, relief, rehabilitation, reconstruction.</h2>
          <p data-reveal style={stagger(1)}>Ideal Relief Wing (IRW) is a registered NGO established in 1992 with a vision to serve society by providing trained volunteer services in dire situations — earthquakes, floods, accidents, landslides, epidemics, and social disturbances like riots.</p>
          <p data-reveal style={stagger(2)}>IRW takes a multifaceted approach, focusing on rescue, relief, rehabilitation and reconstruction in affected areas, with an emphasis on restoring normal life to affected people by all means.</p>
          <p data-reveal style={stagger(3)}>Its history shows an unparalleled track record inside and outside Kerala — services highly appreciated by authorities and media.</p>
        </div>
        <div className="grid grid-cols-2 grid-rows-[260px_200px] gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} data-shutter style={stagger(i)} className={`zoom rounded-[18px] ${i === 0 ? "col-span-2" : ""}`}>
              <Photo src={more[i]?.url} alt={more[i]?.caption} label="IRW volunteers" className="h-full w-full" />
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-10 sm:px-8">
        <h2 data-reveal className="mb-8 text-[clamp(28px,3.4vw,42px)] font-extrabold tracking-tight">Major deployments</h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEPLOYS.map(([y, e, w], i) => (
            <li
              key={y}
              data-reveal
              style={stagger(i)}
              className="group flex flex-col gap-2 rounded-2xl bg-white p-7 transition-colors duration-300 hover:bg-tint"
            >
              <span className="text-[40px] font-extrabold leading-none text-red transition-transform duration-500 [transition-timing-function:var(--ease-out)] group-hover:translate-x-1">{y}</span>
              <span className="mt-3 text-xl font-bold">{e}</span>
              <span className="text-base text-body">{w}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
