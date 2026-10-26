import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin } from "lucide-react";
import type { CSSProperties } from "react";
import { ContactForm } from "@/components/site/ContactForm";
import { PageHero } from "@/components/site/parts";
import { getSettings } from "@/lib/settings";
import { strParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact Us", description: "Contact Ideal Relief Wing Kerala — emergency lines, address and enquiry form." };

export default async function ContactPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  const tel = (p: string) => `tel:${p.replace(/\s/g, "")}`;
  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Contact Us" }]} title="We look forward to hearing from you" intro="For rapid enquiries, call us now. For volunteering, donations or general questions, send a message." />
      <section className="mx-auto -mt-12 flex max-w-[1280px] flex-wrap items-start gap-6 px-4 pb-24 sm:px-8">
        <div className="flex min-w-[300px] flex-[1_1_340px] flex-col gap-4">
          <div data-reveal className="flex flex-col gap-3.5 rounded-[20px] bg-red p-[30px] text-white">
            <h2 className="text-lg font-bold">Emergency lines</h2>
            <a href={tel(s.phone1)} className="link-draw self-start text-[26px] font-extrabold">{s.phone1}</a>
            {s.phone2 && <a href={tel(s.phone2)} className="link-draw self-start text-xl font-bold">{s.phone2}</a>}
            {s.phone3 && <a href={tel(s.phone3)} className="link-draw self-start text-xl font-bold">{s.phone3}</a>}
          </div>
          <div data-reveal style={{ "--i": 1 } as CSSProperties} className="surface flex flex-col gap-[18px] p-[30px]">
            <div className="flex gap-3.5">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-red-tint text-red"><MapPin size={20} /></span>
              <address className="text-[15px] not-italic leading-relaxed text-body"><strong className="text-navy">{s.orgName}</strong><br />{s.address}</address>
            </div>
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 flex-none items-center justify-center rounded-xl bg-tint text-royal"><Mail size={20} /></span>
              <a href={`mailto:${s.email}`} className="link-draw font-semibold text-red">{s.email}</a>
            </div>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.orgName}, ${s.address}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-navy nudge self-start"
            >
              <MapPin size={16} /> Open in Google Maps <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <ContactForm defaultTopic={strParam(sp.topic)} />
      </section>
    </>
  );
}
