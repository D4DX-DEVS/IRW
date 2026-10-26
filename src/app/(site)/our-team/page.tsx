import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Photo, stagger } from "@/components/site/parts";
import { db } from "@/lib/db";
import { strParam, TEAM_GROUPS } from "@/lib/utils";

export const metadata: Metadata = { title: "Our Team", description: "Leaders and governing body members of IRW Kerala." };

export default async function TeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const groupRaw = strParam(sp.group);
  const filled = new Set((await db.teamMember.groupBy({ by: ["groupName"], where: { visible: true } })).map((g) => g.groupName));
  const groups = Object.entries(TEAM_GROUPS).filter(([k]) => k === "GOVERNING" || filled.has(k));
  const group = groups.some(([k]) => k === groupRaw) ? groupRaw : "GOVERNING";
  const members = await db.teamMember.findMany({ where: { visible: true, groupName: group }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });

  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Our Team" }]} title="Our Team" intro="The leaders and governing body members who coordinate IRW volunteers across Kerala." />
      <section className="mx-auto flex max-w-[1280px] flex-col gap-10 px-4 pb-24 pt-16 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-[clamp(24px,3vw,34px)] font-extrabold">{TEAM_GROUPS[group as keyof typeof TEAM_GROUPS]}</h2>
          {groups.length > 1 && <nav aria-label="Team group" className="inline-flex flex-wrap gap-1 rounded-xl bg-bg2 p-1">
            {groups.map(([k, label]) => (
              <Link key={k} href={`/our-team?group=${k}`} aria-current={k === group ? "page" : undefined} className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-95 ${k === group ? "bg-white text-navy" : "text-body hover:bg-white/60 hover:text-navy"}`}>
                {label}
              </Link>
            ))}
          </nav>}
        </div>
        {members.length === 0 ? (
          <p className="surface p-10 text-center text-body">No members listed in this group yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((m, i) => (
              <article key={m.id} data-reveal style={stagger(i % 4)} className="surface group flex flex-col overflow-clip">
                <div className="zoom h-[280px]">
                  <Photo src={m.photoUrl} alt={m.name} label="Portrait" className="h-full w-full object-top" />
                </div>
                <div className="flex flex-col gap-1.5 px-[22px] pb-6 pt-5">
                  <h3 className="text-[19px] font-extrabold tracking-wide transition-colors duration-200 group-hover:text-red">{m.name}</h3>
                  <span className="text-[15px] text-body">{m.designation}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
