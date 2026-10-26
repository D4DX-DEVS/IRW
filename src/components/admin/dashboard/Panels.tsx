import { ArrowUpRight, Award, FileText, Film, Image as ImageIcon, Images, Newspaper, PanelTop, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import type { Overview } from "@/lib/stats";
import { TOPICS } from "@/lib/utils";
import { ago } from "./ago";

function pageName(path: string) {
  if (path === "/") return "Home";
  let p = path;
  try { p = decodeURIComponent(path); } catch { /* keep raw */ }
  const parts = p.split("/").filter(Boolean);
  const head = parts[0].replace(/-/g, " ");
  return parts.length > 1 ? `${head[0].toUpperCase()}${head.slice(1)} › ${parts.slice(1).join(" / ").replace(/-/g, " ")}` : `${head[0].toUpperCase()}${head.slice(1)}`;
}

export function TopPages({ pages }: { pages: Overview["topPages"] }) {
  const max = Math.max(1, ...pages.map((p) => p.views));
  return (
    <section className="card flex flex-col gap-4 rounded-[18px] p-6">
      <div>
        <h2 className="text-lg font-bold">Most visited pages</h2>
        <span className="text-[13px] text-muted">Last 7 days</span>
      </div>
      {pages.length === 0 ? (
        <p className="py-6 text-sm text-muted">No visits recorded this week yet.</p>
      ) : (
        <ol className="flex flex-col gap-3.5">
          {pages.map((p, i) => (
            <li key={p.path} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <a href={p.path} target="_blank" rel="noopener noreferrer" className="ml min-w-0 truncate font-semibold hover:text-red" title={p.path}>{pageName(p.path)}</a>
                <span className="flex-none tabular-nums text-muted">{p.views.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-2 rounded-full bg-bg2">
                <div className="bar-grow h-2 rounded-full bg-royal" style={{ width: `${Math.max(4, (p.views / max) * 100)}%`, animationDelay: `${i * 80}ms` }} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function LatestInquiries({ items, now }: { items: Overview["inquiries"]; now: number }) {
  return (
    <section className="card flex flex-col gap-3 rounded-[18px] p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Latest inquiries</h2>
          <span className="text-[13px] text-muted">From the contact form</span>
        </div>
        <Link href="/admin/inquiries" className="text-sm font-semibold text-red">View all</Link>
      </div>
      {items.length === 0 ? (
        <p className="py-6 text-sm text-muted">No inquiries yet. They will appear here as soon as someone writes in.</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((q) => (
            <li key={q.id} className="flex items-center gap-3 border-b border-bg2 py-2.5 last:border-0">
              <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-tint text-sm font-bold text-royal" aria-hidden>
                {q.name.trim().charAt(0).toUpperCase() || "?"}
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">{q.name}</span>
                <span className="truncate text-xs text-muted">
                  {TOPICS[q.topic as keyof typeof TOPICS] ?? q.topic}{q.district ? ` · ${q.district}` : ""} · {ago(q.at, now)}
                </span>
              </div>
              <StatusBadge status={q.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

type Tile = { href: string; label: string; value: number; icon: ReactNode; tint: string; ink: string };

export function ContentTiles({ content, posts, photos }: { content: Overview["content"]; posts: number; photos: number }) {
  const tiles: Tile[] = [
    { href: "/admin/news", label: "Published posts", value: posts, icon: <Newspaper size={18} />, tint: "#fde8ea", ink: "#b3121f" },
    { href: "/admin/media", label: "Photos", value: photos, icon: <ImageIcon size={18} />, tint: "#dcfce7", ink: "#166534" },
    { href: "/admin/media", label: "Albums", value: content.albums, icon: <Images size={18} />, tint: "#e8f0fa", ink: "#294d8c" },
    { href: "/admin/media", label: "Videos", value: content.videos, icon: <Film size={18} />, tint: "#fef3c7", ink: "#92400e" },
    { href: "/admin/team", label: "Team members", value: content.team, icon: <Users size={18} />, tint: "#ede9fe", ink: "#5b21b6" },
    { href: "/admin/publications", label: "Publications", value: content.publications, icon: <FileText size={18} />, tint: "#e8f0fa", ink: "#172e63" },
    { href: "/admin/banners", label: "Active banners", value: content.banners, icon: <PanelTop size={18} />, tint: "#fde8ea", ink: "#b3121f" },
    { href: "/admin/achievements", label: "Achievements", value: content.achievements, icon: <Award size={18} />, tint: "#fef3c7", ink: "#92400e" },
  ];
  return (
    <section aria-labelledby="content-h" className="flex flex-col gap-3">
      <h2 id="content-h" className="text-lg font-bold">Site content</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {tiles.map((t, i) => (
          <Link key={t.label} href={t.href} className="card lift anim-rise group relative flex flex-col items-start gap-3 rounded-2xl p-4 sm:flex-row sm:items-center" style={{ animationDelay: `${0.05 * i}s` }}>
            <span className="flex size-10 flex-none items-center justify-center rounded-xl" style={{ background: t.tint, color: t.ink }}>{t.icon}</span>
            <span className="flex min-w-0 flex-col">
              <span className="text-lg font-extrabold tabular-nums sm:text-2xl">{t.value.toLocaleString("en-IN")}</span>
              <span className="text-xs leading-snug text-muted sm:text-sm">{t.label}</span>
            </span>
            <ArrowUpRight size={16} className="absolute right-3 top-3 text-muted opacity-0 transition-opacity group-hover:opacity-100 sm:static sm:ml-auto" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}
