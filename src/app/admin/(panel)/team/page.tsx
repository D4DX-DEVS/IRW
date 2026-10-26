import { PageHeader } from "@/components/shared/states";
import { TeamManager } from "@/components/admin/TeamManager";
import { db } from "@/lib/db";
import { strParam, TEAM_GROUPS } from "@/lib/utils";

export const metadata = { title: "Team" };

export default async function AdminTeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const g = strParam(sp.group);
  const group = g in TEAM_GROUPS ? g : "GOVERNING";
  const [members, grouped] = await Promise.all([
    db.teamMember.findMany({ where: { groupName: group }, orderBy: [{ sort: "asc" }, { createdAt: "asc" }] }),
    db.teamMember.groupBy({ by: ["groupName"], _count: true }),
  ]);
  const counts = Object.fromEntries(grouped.map((r) => [r.groupName, r._count]));
  return (
    <>
      <PageHeader crumb="Content / Team" title="Team" />
      <TeamManager members={members} group={group} counts={counts} />
    </>
  );
}
