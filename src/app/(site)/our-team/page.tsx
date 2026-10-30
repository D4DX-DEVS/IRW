import type { Metadata } from "next";
import { PageHero, Photo, stagger } from "@/components/site/parts";
import { cached, TAG } from "@/lib/cache";
import { db } from "@/lib/db";
import { TEAM_GROUPS } from "@/lib/utils";

export const metadata: Metadata = { title: "Our Team", description: "Leaders and governing body members of IRW Kerala.", alternates: { canonical: "/our-team" } };

export const revalidate = 3600;

const getMembers = cached("team", [TAG.team], () => db.teamMember.findMany({ where: { visible: true }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }));

export default async function TeamPage() {
  const members = await getMembers();
  // Every group with members, stacked in TEAM_GROUPS order (Leaders first), as on the old site.
  const groups = Object.entries(TEAM_GROUPS)
    .map(([k, label]) => ({ k, label, people: members.filter((m) => m.groupName === k) }))
    .filter((g) => g.people.length > 0);

  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Our Team" }]} title="Our Team" intro="The leaders and governing body members who coordinate IRW volunteers across Kerala." />
      <div className="mx-auto flex max-w-[1280px] flex-col gap-20 px-4 pb-24 pt-16 sm:px-8">
        {groups.length === 0 && <p className="surface p-10 text-center text-body">No team members listed yet.</p>}
        {groups.map((g) => (
          <section key={g.k} aria-labelledby={`team-${g.k}`} className="flex flex-col gap-10">
            <h2 id={`team-${g.k}`} className="text-[clamp(24px,3vw,34px)] font-extrabold">{g.label}</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {g.people.map((m, i) => (
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
          </section>
        ))}
      </div>
    </>
  );
}
