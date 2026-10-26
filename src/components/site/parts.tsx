import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

export function PageHero({ crumbs, title, intro, image }: { crumbs: { href?: string; label: string }[]; title: string; intro?: string; image?: { src: string; alt: string } }) {
  return (
    <section className="bg-royal text-white">
      <div className={`mx-auto grid max-w-[1280px] items-center gap-10 px-4 pb-20 pt-16 sm:px-8 ${image ? "lg:grid-cols-[1fr_1.4fr] lg:gap-14" : ""}`}>
        <div className="flex flex-col gap-4">
          <nav aria-label="Breadcrumb" className="text-sm text-[#dbe4f2]" data-load style={{ "--d": "0ms" } as CSSProperties}>
            {crumbs.map((c, i) => (
              <span key={c.label}>
                {i > 0 && " / "}
                {c.href ? <Link href={c.href} className="link-draw hover:text-white">{c.label}</Link> : c.label}
              </span>
            ))}
          </nav>
          <h1 className="lines text-[clamp(38px,5vw,64px)] font-extrabold leading-[1.05] tracking-tight">
            <span className="line"><span data-line>{title}</span></span>
          </h1>
          {intro && <p className="max-w-2xl text-[19px] leading-relaxed text-[#dbe4f2]" data-load style={{ "--d": "380ms" } as CSSProperties}>{intro}</p>}
        </div>
        {image && (
          <div data-shutter className="overflow-clip rounded-3xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image.src} alt={image.alt} fetchPriority="high" className="h-[clamp(260px,46vw,680px)] w-full object-cover" />
          </div>
        )}
      </div>
    </section>
  );
}

/** Spreads a stagger index onto an element revealed with data-reveal. */
export const stagger = (i: number) => ({ "--i": i }) as CSSProperties;

export function Photo({ src, alt = "", label, className = "" }: { src?: string | null; alt?: string; label?: string; className?: string }) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
  }
  return (
    <div className={`ph flex items-end p-3.5 text-xs uppercase tracking-wider text-white/75 ${className}`} role="img" aria-label={alt || label || "Photo placeholder"}>
      {label}
    </div>
  );
}

/** Link-based pagination so every page is a real, crawlable server-rendered URL. */
export function SitePagination({ page, totalPages, basePath, params = {} }: { page: number; totalPages: number; basePath: string; params?: Record<string, string> }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const q = new URLSearchParams({ ...params, page: String(p) });
    return `${basePath}?${q.toString()}`;
  };
  const nums: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "…") nums.push("…");
  }
  const base = "inline-flex h-11 min-w-11 items-center justify-center rounded-[10px] px-3 text-[15px] font-semibold transition-[background-color,color,transform] duration-200 active:scale-95";
  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-4 pt-4">
      {page > 1 ? (
        <Link href={href(page - 1)} className={`${base} gap-2 bg-white hover:bg-tint`} rel="prev">
          <ChevronLeft size={16} /> Previous
        </Link>
      ) : (
        <span className={`${base} gap-2 bg-white/60 text-[#7d8aa0]`} aria-disabled="true">
          <ChevronLeft size={16} /> Previous
        </span>
      )}
      <div className="flex gap-1.5">
        {nums.map((n, i) =>
          n === "…" ? (
            <span key={`e${i}`} className={base}>…</span>
          ) : (
            <Link key={n} href={href(n)} aria-current={n === page ? "page" : undefined} className={`${base} ${n === page ? "bg-navy text-white" : "bg-white hover:bg-tint"}`}>
              {n}
            </Link>
          ),
        )}
      </div>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={`${base} gap-2 bg-white hover:bg-tint`} rel="next">
          Next <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${base} gap-2 bg-white/60 text-[#7d8aa0]`} aria-disabled="true">
          Next <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}

/** Renders plain-text article bodies safely (no HTML injection): paragraphs, "## " headings, "> " quotes, bare URLs. */
export function Body({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const linkify = (s: string) =>
    s.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
      /^https?:\/\//.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-red underline">
          {part}
        </a>
      ) : (
        part
      ),
    );
  return (
    <div className="prose-irw ml text-[18px] text-body">
      {blocks.map((b, i) =>
        b.startsWith("## ") ? (
          <h2 key={i} className="font-ml text-navy">{b.slice(3)}</h2>
        ) : b.startsWith("> ") ? (
          <blockquote key={i} className="my-2 mb-5 rounded-2xl bg-bg2 px-7 py-6 text-[21px] font-semibold leading-8 text-navy">
            {b.replace(/^>\s?/gm, "")}
          </blockquote>
        ) : (
          <p key={i} className="whitespace-pre-line">{linkify(b)}</p>
        ),
      )}
    </div>
  );
}
