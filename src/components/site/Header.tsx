import Link from "next/link";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { HeaderNav } from "./HeaderNav";

export async function Header() {
  const [s, pubs] = await Promise.all([
    getSettings(),
    db.publication.findMany({ where: { showInMenu: true }, orderBy: [{ year: "desc" }, { createdAt: "desc" }], take: 6, select: { id: true, title: true, fileUrl: true } }),
  ]);
  return (
    <header className="site-header sticky top-0 z-40 bg-white">
      <div className="bg-navy text-[13px] text-[#c9d2e0]">
        <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-2 sm:px-8 lg:px-10">
          <span>
            For rapid enquiries, call{" "}
            <a href={`tel:${s.phone1.replace(/\s/g, "")}`} className="font-bold text-white">
              {s.phone1}
            </a>
          </span>
          <span className="hidden gap-5 sm:flex">
            <a href={`mailto:${s.email}`} className="link-draw hover:text-white">{s.email}</a>
            <span>Kottakkal, Malappuram</span>
          </span>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-3 sm:px-8 lg:px-10">
        <Link href="/" className="brand flex items-center gap-3">
          {s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt={s.orgName} width={604} height={173} className="h-[60px] w-auto sm:h-[80px]" />
          ) : (
            <>
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-full border-[3px] border-red bg-white text-sm font-black text-royal">IRW</span>
              <span className="flex flex-col leading-tight">
                <span className="text-[19px] font-black tracking-tight">
                  <span className="text-red">Ideal Relief Wing</span> Kerala
                </span>
                <span className="hidden text-[11px] font-semibold uppercase tracking-[.08em] text-muted sm:block">{s.tagline}</span>
              </span>
            </>
          )}
        </Link>
        <HeaderNav pubs={pubs} />
      </div>
    </header>
  );
}
