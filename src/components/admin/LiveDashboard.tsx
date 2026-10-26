"use client";
import { Activity, Eye, FileText, Image as ImageIcon, MessageSquare, Minus, Newspaper, Plus, TrendingDown, TrendingUp, Upload, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Tabs } from "@/components/ui/Tabs";
import type { DayPoint, Stats } from "@/lib/stats";
import { ago } from "./dashboard/ago";
import { TrafficChart } from "./dashboard/TrafficChart";

function useTween(target: number, ms = 900) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const cur = a + (target - a) * e;
      setV(cur);
      from.current = cur;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return Math.round(v);
}

function Num({ value }: { value: number }) {
  const v = useTween(value);
  return <span className="tabular-nums">{v.toLocaleString("en-IN")}</span>;
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(1, ...data);
  return (
    <div className="flex h-[30px] items-end gap-[3px]" aria-hidden>
      {data.map((d, i) => (
        <span key={i} className="flex-1 rounded-[3px] transition-[height] duration-700" style={{ height: `${Math.max(8, (d / max) * 100)}%`, background: color, opacity: i === data.length - 1 ? 1 : 0.45 }} />
      ))}
    </div>
  );
}

/** Week-over-week change. Direction is carried by the icon and words, not color alone. */
function Trend({ cur, prev }: { cur: number; prev: number }) {
  if (prev === 0 && cur === 0) return <span className="text-[13px] font-semibold text-muted">No visits in the last 2 weeks</span>;
  if (prev === 0) return <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-green-700"><TrendingUp size={14} /> New this week</span>;
  const pct = Math.round(((cur - prev) / prev) * 100);
  const Icon = pct > 0 ? TrendingUp : pct < 0 ? TrendingDown : Minus;
  const cls = pct > 0 ? "text-green-700" : pct < 0 ? "text-red-dark" : "text-muted";
  return (
    <span className={`inline-flex items-center gap-1 text-[13px] font-semibold ${cls}`}>
      <Icon size={14} /> {pct > 0 ? "Up" : pct < 0 ? "Down" : "Flat"} {Math.abs(pct)}% <span className="font-normal text-muted">vs last week</span>
    </span>
  );
}

function Kpi({ label, value, icon, tint, ink, foot, spark, delay, pulse }: { label: string; value: number; icon: ReactNode; tint: string; ink: string; foot: ReactNode; spark?: number[]; delay: number; pulse?: boolean }) {
  return (
    <div className="card lift anim-rise relative flex flex-col gap-3 overflow-hidden rounded-[18px] p-4 sm:p-5" style={{ animationDelay: `${delay}s` }}>
      <span aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full opacity-60" style={{ background: tint }} />
      <div className="relative flex items-center justify-between gap-2">
        <span className="text-xs font-semibold leading-snug text-muted sm:text-sm">{label}</span>
        <span className={`flex size-9 flex-none items-center justify-center rounded-[10px] bg-white ${pulse ? "live-dot" : ""}`} style={{ color: ink }}>{icon}</span>
      </div>
      <span className="relative text-[26px] font-extrabold leading-none tracking-tight sm:text-[34px]"><Num value={value} /></span>
      {spark ? <Spark data={spark} color={ink} /> : <div className="h-[30px]" />}
      <div className="relative min-h-5">{foot}</div>
    </div>
  );
}

const KIND: Record<string, { tint: string; ink: string; icon: ReactNode }> = {
  post: { tint: "#fde8ea", ink: "#b3121f", icon: <Newspaper size={15} /> },
  inquiry: { tint: "#e8f0fa", ink: "#294d8c", icon: <MessageSquare size={15} /> },
  gallery: { tint: "#dcfce7", ink: "#166534", icon: <ImageIcon size={15} /> },
  team: { tint: "#fef3c7", ink: "#92400e", icon: <Users size={15} /> },
  publication: { tint: "#e8f0fa", ink: "#294d8c", icon: <FileText size={15} /> },
};
const fallback = { tint: "#eef3f9", ink: "#56657a", icon: <Activity size={15} /> };

function subscribeSecond(cb: () => void) {
  const t = setInterval(cb, 1000);
  return () => clearInterval(t);
}

function Welcome({ name, s, live }: { name: string; s: Stats; live: boolean }) {
  // Server renders no clock (0); the browser ticks it in the viewer's own time zone.
  const sec = useSyncExternalStore(subscribeSecond, () => Math.floor(Date.now() / 1000), () => 0);
  const clock = sec ? new Date(sec * 1000) : null;
  const hour = clock?.getHours() ?? 12;
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = name.split(" ")[0] || name;

  return (
    <section className="relative isolate overflow-hidden rounded-[22px] bg-gradient-to-br from-navy-deep via-navy to-royal p-6 text-white sm:p-8">
      <span aria-hidden className="float-slow absolute -right-16 -top-20 -z-10 size-64 rounded-full bg-sky-light/25 blur-2xl" />
      <span aria-hidden className="float-slow absolute -bottom-24 right-1/3 -z-10 size-56 rounded-full bg-red/25 blur-2xl [animation-delay:-4s]" />
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5 text-[13px]">
            <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold ${live ? "bg-green-500/20 text-green-100" : "bg-amber-400/20 text-amber-100"}`} role="status">
              <span className={`h-2 w-2 rounded-full ${live ? "live-dot bg-green-400" : "bg-amber-400"}`} />
              {live ? "Live · updates every 3s" : "Reconnecting…"}
            </span>
            <span className="tabular-nums text-white/75" suppressHydrationWarning>
              {clock ? `${clock.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })} · ${clock.toLocaleTimeString("en-GB")}` : " "}
            </span>
          </div>
          <h1 className="text-[clamp(26px,3.4vw,38px)] font-extrabold leading-tight tracking-tight" suppressHydrationWarning>{greet}, {first}</h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-white/85">
            {s.online > 0 ? <><strong className="text-white">{s.online}</strong> {s.online === 1 ? "person is" : "people are"} on the site right now. </> : "The site is quiet right now. "}
            <strong className="text-white">{s.viewsToday.toLocaleString("en-IN")}</strong> page views today
            {s.openInquiries > 0 ? <>, and <strong className="text-white">{s.openInquiries}</strong> {s.openInquiries === 1 ? "inquiry needs" : "inquiries need"} a reply.</> : ", and every inquiry is answered."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/admin/news/new" className="btn btn-red"><Plus size={16} /> New post</Link>
          <Link href="/admin/media" className="btn border-white/25 bg-white/10 text-white hover:bg-white/20"><Upload size={16} /> Upload photos</Link>
          <Link href="/admin/inquiries" className="btn border-white/25 bg-white/10 text-white hover:bg-white/20"><MessageSquare size={16} /> Inquiries</Link>
        </div>
      </div>
    </section>
  );
}

export function LiveDashboard({ initial, month, name }: { initial: Stats; month: DayPoint[]; name: string }) {
  const [s, setS] = useState(initial);
  const [live, setLive] = useState(false);
  const [metric, setMetric] = useState<"views" | "visitors">("views");
  const [range, setRange] = useState<"7" | "30">("7");
  const [now, setNow] = useState(initial.at);
  const [online, setOnline] = useState<number[]>([initial.online]);
  const seen = useRef(new Set(initial.feed.map((f) => f.id)));
  const [fresh, setFresh] = useState<Set<string>>(new Set());

  useEffect(() => {
    const es = new EventSource("/api/admin/live");
    es.onopen = () => setLive(true);
    es.onerror = () => setLive(false);
    es.onmessage = (e) => {
      const next = JSON.parse(e.data) as Stats;
      const added = next.feed.filter((f) => !seen.current.has(f.id)).map((f) => f.id);
      added.forEach((id) => seen.current.add(id));
      if (added.length) {
        setFresh(new Set(added));
        setTimeout(() => setFresh(new Set()), 1500);
      }
      setS(next);
      setNow(next.at);
      setOnline((o) => [...o.slice(-11), next.online]);
      setLive(true);
    };
    const tick = setInterval(() => setNow((n) => n + 15000), 15000);
    return () => {
      es.close();
      clearInterval(tick);
    };
  }, []);

  // The 30-day series is loaded once; its last 7 days follow the live feed.
  const series = range === "7" ? s.week : [...month.slice(0, Math.max(0, month.length - 7)), ...s.week];

  return (
    <>
      <Welcome name={name} s={s} live={live} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Kpi label="Online now" value={s.online} icon={<Activity size={18} />} tint="#dcfce7" ink="#16a34a" pulse={live} foot={<span className="text-[13px] font-semibold text-muted">Active in the last 5 min</span>} spark={online.length > 1 ? online : undefined} delay={0} />
        <Kpi label="Views, last 7 days" value={s.views7d} icon={<Eye size={18} />} tint="#e8f0fa" ink="#294d8c" foot={<Trend cur={s.views7d} prev={s.prevViews7d} />} spark={s.week.map((d) => d.views)} delay={0.08} />
        <Kpi label="Visitors, last 7 days" value={s.visitors7d} icon={<Users size={18} />} tint="#ede9fe" ink="#5b21b6" foot={<Trend cur={s.visitors7d} prev={s.prevVisitors7d} />} spark={s.week.map((d) => d.visitors)} delay={0.16} />
        <Kpi label="Open inquiries" value={s.openInquiries} icon={<MessageSquare size={18} />} tint="#fef3c7" ink="#b45309" foot={s.openInquiries ? <Link href="/admin/inquiries" className="text-[13px] font-semibold text-red hover:underline">Reply now →</Link> : <span className="text-[13px] font-semibold text-green-700">All caught up</span>} delay={0.24} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="card anim-rise flex min-w-0 flex-col gap-4 rounded-[18px] p-4 sm:p-6" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold">Site traffic</h2>
              <span className="text-[13px] text-muted">
                <strong className="tabular-nums text-navy">{series.reduce((a, d) => a + d[metric], 0).toLocaleString("en-IN")}</strong> {metric} in the last {range} days · hover for each day
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Tabs value={metric} onValueChange={(v) => setMetric(v as "views" | "visitors")} items={[{ value: "views", label: "Views" }, { value: "visitors", label: "Visitors" }]} />
              <Tabs value={range} onValueChange={(v) => setRange(v as "7" | "30")} items={[{ value: "7", label: "7 days" }, { value: "30", label: "30 days" }]} />
            </div>
          </div>
          <TrafficChart data={series} metric={metric} />
        </section>

        <section className="card anim-rise flex flex-col gap-3 rounded-[18px] p-4 sm:p-6" style={{ animationDelay: "0.38s" }}>
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              Live activity <span className={`h-2 w-2 rounded-full ${live ? "live-dot bg-green-600" : "bg-amber-500"}`} aria-hidden />
            </h2>
            <span className="text-xs text-muted">{s.publishedPosts} published · {s.draftPosts} drafts</span>
          </div>
          <ul className="flex flex-col">
            {s.feed.length === 0 && <li className="py-6 text-sm text-muted">No activity yet. Edits, uploads and new inquiries will stream in here.</li>}
            {s.feed.map((f) => {
              const k = KIND[f.kind] ?? fallback;
              return (
                <li key={f.id} className={`flex items-start gap-3 rounded-lg border-b border-bg2 px-1.5 py-2.5 transition-colors last:border-0 ${fresh.has(f.id) ? "anim-slide-down bg-tint" : ""}`}>
                  <span className="flex size-8 flex-none items-center justify-center rounded-full" style={{ background: k.tint, color: k.ink }}>{k.icon}</span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-sm leading-snug"><strong>{f.actor}</strong> {f.verb}</span>
                    <span className="text-xs text-muted">{ago(f.at, now)}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </>
  );
}
