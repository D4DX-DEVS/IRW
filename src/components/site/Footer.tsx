import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

const EXPLORE = [
  ["/about-us", "About Us"],
  ["/our-team", "Our Team"],
  ["/articles", "Achievements"],
  ["/images", "Gallery"],
  ["/news-events", "News & Events"],
  ["/publications", "Publications"],
];

export async function Footer() {
  const s = await getSettings();
  const tel = (p: string) => `tel:${p.replace(/\s/g, "")}`;
  const social = [
    { href: s.facebook, label: "Facebook", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21z"/></svg> },
    { href: s.youtube, label: "YouTube", icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3z"/></svg> },
    { href: s.whatsapp ? `https://wa.me/${s.whatsapp}` : "", label: "WhatsApp", icon: <MessageCircle size={18} /> },
  ].filter((x) => x.href);

  return (
    <footer className="bg-navy-deep text-white">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 pb-8 pt-12 sm:px-8 md:grid-cols-[2fr_1fr_1.4fr] md:gap-12 md:pb-10 md:pt-[72px]">
        <div className="flex flex-col gap-4">
          {s.logoWhiteUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoWhiteUrl} alt={s.orgName} width={592} height={148} className="h-11 w-auto self-start md:h-14" />
          ) : (
            <div className="flex items-center gap-3">
              <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full border-[3px] border-[#ff4d5e] text-[13px] font-black">IRW</span>
              <span className="text-xl font-extrabold">{s.orgName}</span>
            </div>
          )}
          <p className="line-clamp-4 max-w-md text-[15px] leading-6 text-[#dbe4f2] md:line-clamp-none md:text-base md:leading-7">{s.about}</p>
          <div className="flex gap-2.5">
            {social.map((x) => (
              <a key={x.label} href={x.href} aria-label={x.label} target="_blank" rel="noopener" className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-white/10 transition-[background-color,transform] duration-200 hover:-translate-y-0.5 hover:bg-white/20 active:scale-95">
                {x.icon}
              </a>
            ))}
          </div>
        </div>
        {/* Two columns of links on a phone keep the footer short; one column from md up. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 md:flex md:flex-col md:gap-3">
          <h2 className="col-span-2 text-lg font-bold text-white">Explore</h2>
          {EXPLORE.map(([h, l]) => (
            <Link key={h} href={h} className="self-start text-[15px] text-[#dbe4f2] transition-colors duration-200 hover:text-white md:text-base">
              <span className="link-draw">{l}</span>
            </Link>
          ))}
        </div>
        <div className="flex flex-col gap-2.5 text-[15px] md:gap-3 md:text-base">
          <h2 className="text-lg font-bold text-white">Contact</h2>
          <address className="not-italic leading-6 text-[#dbe4f2] md:leading-7">{s.address}</address>
          {[s.phone1, s.phone2, s.phone3].filter(Boolean).map((p) => (
            <a key={p} href={tel(p)} className="self-start text-[#dbe4f2] transition-colors duration-200 hover:text-white">
              <span className="link-draw">(+91) {p.replace(/^\+91\s?/, "")}</span>
            </a>
          ))}
          <a href={`mailto:${s.email}`} className="self-start text-[#dbe4f2] transition-colors duration-200 hover:text-white">
            <span className="link-draw">{s.email}</span>
          </a>
        </div>
      </div>
      <div className="bg-black/20">
        <div className="mx-auto flex max-w-[1280px] flex-wrap justify-between gap-3 px-4 py-4 text-[13px] text-[#c9d2e0] sm:px-8 md:py-5 md:text-sm">
          <span>© {new Date().getFullYear()} IRW Kerala. All rights reserved.</span>
          <span className="hidden md:inline">Rescue · Relief · Rehabilitation · Reconstruction</span>
        </div>
      </div>
    </footer>
  );
}
