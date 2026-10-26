import type { Metadata } from "next";
import { Download } from "lucide-react";
import Link from "next/link";
import { PageHero, stagger } from "@/components/site/parts";
import { db } from "@/lib/db";
import { fmtBytes, strParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Publications", description: "Annual reports and rescue reports published by IRW Kerala." };

const CATS = { ANNUAL: "Annual reports", RESCUE: "Rescue reports", OTHER: "Other" } as const;
const BG = ["bg-navy", "bg-red-dark", "bg-royal", "bg-[#143a3a]"];

export default async function PublicationsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const cat = strParam(sp.category);
  const filled = new Set((await db.publication.groupBy({ by: ["category"] })).map((g) => g.category));
  const cats = Object.entries(CATS).filter(([k]) => filled.has(k));
  const docs = await db.publication.findMany({ where: cat in CATS ? { category: cat } : {}, orderBy: [{ year: "desc" }, { createdAt: "desc" }] });
  const chip = (on: boolean) => `inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-95 ${on ? "bg-navy text-white" : "bg-white hover:bg-tint"}`;

  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Publications" }]} title="Publications" intro="Annual reports and rescue reports, published for transparency and accountability." />
      <section className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 pb-24 pt-14 sm:px-8">
        {cats.length > 1 && <nav aria-label="Category" className="flex flex-wrap gap-2">
          <Link href="/publications" className={chip(!(cat in CATS))}>All</Link>
          {cats.map(([k, l]) => (
            <Link key={k} href={`/publications?category=${k}`} className={chip(cat === k)}>{l}</Link>
          ))}
        </nav>}
        {docs.length === 0 && <p className="surface p-10 text-center text-body">No publications in this category yet.</p>}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {docs.map((d, i) => (
            <a key={d.id} href={d.fileUrl} target="_blank" rel="noopener" data-reveal style={stagger(i)} className="surface group flex flex-col overflow-clip transition-transform duration-300 hover:-translate-y-1 active:scale-[0.98]">
              <div className={`flex h-[300px] flex-col justify-between p-[26px] text-white ${BG[i % BG.length]}`}>
                <span className="text-base font-bold">IRW Kerala</span>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[15px] opacity-85">{CATS[d.category as keyof typeof CATS]}</span>
                  <span className="text-5xl font-extrabold leading-none tracking-tight transition-transform duration-500 group-hover:-translate-y-1">{d.year}</span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 px-[22px] py-5">
                <div className="flex min-w-0 flex-col gap-1">
                  <span className="font-bold">{d.title}</span>
                  <span className="text-sm text-body">PDF · {fmtBytes(d.sizeBytes)}</span>
                </div>
                <span aria-hidden className="flex h-11 w-11 flex-none items-center justify-center rounded-[10px] bg-red-tint text-red transition-[background-color,color] duration-200 group-hover:bg-red group-hover:text-white"><Download size={18} className="transition-transform duration-300 group-hover:translate-y-0.5" /></span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
