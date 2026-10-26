import Link from "next/link";
import { ContentTiles, LatestInquiries, TopPages } from "@/components/admin/dashboard/Panels";
import { LiveDashboard } from "@/components/admin/LiveDashboard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getOverview, getStats } from "@/lib/stats";
import { fmtDate, POST_TYPES } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const me = await requireSession();
  const [stats, overview, recent] = await Promise.all([getStats(), getOverview(), db.post.findMany({ where: { deletedAt: null }, orderBy: { updatedAt: "desc" }, take: 5 })]);

  return (
    <>
      <LiveDashboard initial={stats} month={overview.month} name={me.name} />
      <ContentTiles content={overview.content} posts={stats.publishedPosts} photos={stats.photos} />
      <div className="grid gap-4 lg:grid-cols-2">
        <TopPages pages={overview.topPages} />
        <LatestInquiries items={overview.inquiries} now={stats.at} />
      </div>
      <section className="card rounded-[18px] p-4 sm:p-6">
        <div className="mb-3.5 flex items-center justify-between">
          <h2 className="text-lg font-bold">Recently edited</h2>
          <Link href="/admin/news" className="text-sm font-semibold text-red">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-2 py-2.5 font-semibold">Title</th>
                <th className="hidden px-2 py-2.5 font-semibold sm:table-cell">Type</th>
                <th className="px-2 py-2.5 font-semibold">Status</th>
                <th className="hidden px-2 py-2.5 font-semibold md:table-cell">Views</th>
                <th className="hidden px-2 py-2.5 font-semibold md:table-cell">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} className="border-t border-bg2">
                  <td className="max-w-[360px] truncate px-2 py-3 font-semibold"><Link href={`/admin/news/${r.id}`} className="hover:text-red">{r.title}</Link></td>
                  <td className="hidden px-2 py-3 text-muted sm:table-cell">{POST_TYPES[r.type as keyof typeof POST_TYPES]}</td>
                  <td className="px-2 py-3"><StatusBadge status={r.status} /></td>
                  <td className="hidden px-2 py-3 tabular-nums md:table-cell">{r.views}</td>
                  <td className="hidden px-2 py-3 text-muted md:table-cell">{fmtDate(r.updatedAt)}</td>
                </tr>
              ))}
              {recent.length === 0 && <tr><td colSpan={5} className="px-2 py-8 text-center text-muted">No posts yet — create the first one.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
