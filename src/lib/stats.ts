import "server-only";
import { db } from "./db";

export interface DayPoint { day: string; label: string; views: number; visitors: number }

export interface Stats {
  online: number;
  viewsToday: number;
  views7d: number;
  visitors7d: number;
  /** Same totals for the 7 days before, for the trend chips. */
  prevViews7d: number;
  prevVisitors7d: number;
  week: DayPoint[];
  publishedPosts: number;
  draftPosts: number;
  openInquiries: number;
  photos: number;
  feed: { id: string; actor: string; verb: string; kind: string; at: string }[];
  at: number;
}

/** Slower-moving numbers: computed once per page load, not on every live tick. */
export interface Overview {
  month: DayPoint[];
  topPages: { path: string; views: number }[];
  content: { albums: number; videos: number; team: number; publications: number; banners: number; achievements: number };
  inquiries: { id: string; name: string; topic: string; district: string; status: string; at: string }[];
}

const DAY = 86400_000;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Buckets page views into `days` daily points ending today. */
function bucket(views: { createdAt: Date; sessionId: string }[], start: Date, days: number): DayPoint[] {
  const buckets = Array.from({ length: days }, (_, i) => {
    const d = new Date(start.getTime() + i * DAY);
    return {
      key: d.toDateString(),
      day: i === days - 1 ? "Today" : d.toLocaleDateString("en-GB", { weekday: "short" }),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      views: 0,
      sessions: new Set<string>(),
    };
  });
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const v of views) {
    const b = byKey.get(v.createdAt.toDateString());
    if (b) {
      b.views++;
      b.sessions.add(v.sessionId);
    }
  }
  return buckets.map((b) => ({ day: b.day, label: b.label, views: b.views, visitors: b.sessions.size }));
}

export async function getStats(): Promise<Stats> {
  const now = new Date();
  const today = startOfToday();
  const start14 = new Date(today.getTime() - 13 * DAY);
  const start7 = new Date(today.getTime() - 6 * DAY);
  const fiveMinAgo = new Date(now.getTime() - 5 * 60_000);

  const [onlineRows, views, publishedPosts, draftPosts, openInquiries, photos, feed] = await Promise.all([
    db.pageView.findMany({ where: { createdAt: { gte: fiveMinAgo } }, distinct: ["sessionId"], select: { sessionId: true } }),
    db.pageView.findMany({ where: { createdAt: { gte: start14 } }, select: { createdAt: true, sessionId: true } }),
    db.post.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    db.post.count({ where: { deletedAt: null, status: { in: ["DRAFT", "SCHEDULED"] } } }),
    db.inquiry.count({ where: { status: "OPEN" } }),
    db.photo.count(),
    db.activity.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const cur = views.filter((v) => v.createdAt >= start7);
  const prev = views.filter((v) => v.createdAt < start7);
  const week = bucket(cur, start7, 7);

  return {
    online: onlineRows.length,
    viewsToday: week[6].views,
    views7d: cur.length,
    visitors7d: new Set(cur.map((v) => v.sessionId)).size,
    prevViews7d: prev.length,
    prevVisitors7d: new Set(prev.map((v) => v.sessionId)).size,
    week,
    publishedPosts,
    draftPosts,
    openInquiries,
    photos,
    feed: feed.map((f) => ({ id: f.id, actor: f.actor, verb: f.verb, kind: f.kind, at: f.createdAt.toISOString() })),
    at: Date.now(),
  };
}

export async function getOverview(): Promise<Overview> {
  const today = startOfToday();
  const start30 = new Date(today.getTime() - 29 * DAY);
  const start7 = new Date(today.getTime() - 6 * DAY);

  const [views, top, albums, videos, team, publications, banners, achievements, inquiries] = await Promise.all([
    db.pageView.findMany({ where: { createdAt: { gte: start30 } }, select: { createdAt: true, sessionId: true } }),
    db.pageView.groupBy({ by: ["path"], where: { createdAt: { gte: start7 } }, _count: { _all: true }, orderBy: { _count: { path: "desc" } }, take: 6 }),
    db.album.count(),
    db.video.count(),
    db.teamMember.count({ where: { visible: true } }),
    db.publication.count(),
    db.banner.count({ where: { active: true } }),
    db.post.count({ where: { deletedAt: null, status: "PUBLISHED", type: "ACHIEVEMENT" } }),
    db.inquiry.findMany({ orderBy: { createdAt: "desc" }, take: 5, select: { id: true, name: true, topic: true, district: true, status: true, createdAt: true } }),
  ]);

  return {
    month: bucket(views, start30, 30),
    topPages: top.map((t) => ({ path: t.path, views: t._count._all })),
    content: { albums, videos, team, publications, banners, achievements },
    inquiries: inquiries.map((q) => ({ id: q.id, name: q.name, topic: q.topic, district: q.district, status: q.status, at: q.createdAt.toISOString() })),
  };
}
