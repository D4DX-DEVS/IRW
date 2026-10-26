"use client";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { DayPoint } from "@/lib/stats";

const H = 260;
const PAD = { top: 16, right: 12, bottom: 28, left: 36 };
const INK = "#294d8c";

/** Rounds the axis top up to a friendly number so gridlines land on clean values. */
function niceMax(v: number) {
  if (v <= 4) return 4;
  const step = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / step;
  return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * step;
}

/** Monotone cubic (Fritsch–Carlson): smooth, but never dips below zero between points. */
function smoothPath(pts: [number, number][]) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : "";
  const n = pts.length;
  const d = pts.slice(1).map((p, i) => (p[1] - pts[i][1]) / (p[0] - pts[i][0]));
  const m = pts.map((_, i) => (i === 0 ? d[0] : i === n - 1 ? d[n - 2] : d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2));
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
    const a = m[i] / d[i], b = m[i + 1] / d[i], s = a * a + b * b;
    if (s > 9) { const t = 3 / Math.sqrt(s); m[i] = t * a * d[i]; m[i + 1] = t * b * d[i]; }
  }
  let out = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], dx = (x1 - x0) / 3;
    out += `C${x0 + dx},${y0 + m[i] * dx} ${x1 - dx},${y1 - m[i + 1] * dx} ${x1},${y1}`;
  }
  return out;
}

export function TrafficChart({ data, metric }: { data: DayPoint[]; metric: "views" | "visitors" }) {
  const wrap = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const [hover, setHover] = useState<number | null>(null);
  const gid = useId();

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.max(280, e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const values = data.map((d) => d[metric]);
  const top = niceMax(Math.max(0, ...values));
  const iw = w - PAD.left - PAD.right;
  const ih = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (data.length < 2 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => PAD.top + ih - (v / top) * ih;
  const pts = values.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = smoothPath(pts);
  const area = line ? `${line}L${x(data.length - 1)},${PAD.top + ih}L${x(0)},${PAD.top + ih}Z` : "";
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(top * t));
  // Thin out day labels so each gets ~52px; the last ("Today") always shows, so skip any too close to it.
  const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(iw / 52))));
  const showLabel = (i: number) => i === data.length - 1 || (i % labelEvery === 0 && data.length - 1 - i >= labelEvery);
  const unit = metric === "views" ? "views" : "visitors";

  const pick = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - r.left) / r.width;
    setHover(Math.max(0, Math.min(data.length - 1, Math.round(rel * (data.length - 1)))));
  };
  const keys = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover((h) => Math.max(0, Math.min(data.length - 1, (h ?? data.length - 1) + (e.key === "ArrowRight" ? 1 : -1))));
  };

  const h = hover !== null ? data[hover] : null;
  const tipLeft = hover !== null ? Math.min(Math.max(x(hover), 70), w - 70) : 0;

  return (
    <div ref={wrap} className="relative w-full">
      <svg
        width={w}
        height={H}
        role="img"
        aria-label={`${unit} per day, use left and right arrow keys to read each day`}
        tabIndex={0}
        onKeyDown={keys}
        onBlur={() => setHover(null)}
        className="block rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-royal"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={INK} stopOpacity="0.28" />
            <stop offset="1" stopColor={INK} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.left} x2={w - PAD.right} y1={y(t)} y2={y(t)} stroke="#dce4ef" strokeDasharray={i === 0 ? undefined : "3 4"} />
            <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-muted text-[11px] tabular-nums">{t}</text>
          </g>
        ))}
        {data.map((d, i) =>
          showLabel(i) ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}className={`text-[11px] ${i === data.length - 1 ? "fill-navy font-bold" : "fill-muted"}`}>
              {data.length > 10 ? (i === data.length - 1 ? "Today" : d.label) : d.day}
            </text>
          ) : null,
        )}
        {/* key on the series so the draw-in replays when the view changes */}
        <g key={`${metric}-${data.length}`}>
          <path d={area} fill={`url(#${gid})`} className="anim-fade-slow" />
          <path d={line} fill="none" stroke={INK} strokeWidth={2} strokeLinecap="round" pathLength={1} className="chart-draw" />
        </g>
        {/* Today's point pulses so the live edge of the chart reads at a glance. */}
        {pts.length > 0 && (
          <g>
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={9} fill="#d7182a" opacity={0.18} className="chart-ping" />
            <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={4.5} fill="#d7182a" stroke="#fff" strokeWidth={2} />
          </g>
        )}
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} stroke="#172e63" strokeOpacity={0.35} />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r={5} fill={INK} stroke="#fff" strokeWidth={2} />
          </g>
        )}
        <rect x={PAD.left} y={PAD.top} width={iw} height={ih} fill="transparent" onPointerMove={pick} onPointerLeave={() => setHover(null)} />
      </svg>
      {h && (
        <div className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-lg bg-navy px-3 py-2 text-xs text-white shadow-lg" style={{ left: tipLeft }}>
          <div className="font-semibold">{hover === data.length - 1 ? "Today" : h.label}</div>
          <div className="tabular-nums">
            <strong className="text-sm">{h[metric].toLocaleString("en-IN")}</strong> {unit}
            {metric === "views" && <span className="text-white/70"> · {h.visitors} visitors</span>}
          </div>
        </div>
      )}
      <table className="sr-only">
        <caption>{unit} per day</caption>
        <thead><tr><th>Day</th><th>Views</th><th>Visitors</th></tr></thead>
        <tbody>{data.map((d, i) => <tr key={i}><td>{d.label}</td><td>{d.views}</td><td>{d.visitors}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
