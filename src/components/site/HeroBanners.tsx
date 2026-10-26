"use client";
import { useEffect, useState } from "react";

export interface HeroBanner { id: string; title: string; subtitle: string; imageUrl: string | null; ctaLabel: string; ctaHref: string }

export function HeroBanners({ banners }: { banners: HeroBanner[] }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const n = banners.length;

  useEffect(() => {
    if (!playing || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), 6500);
    return () => clearInterval(t);
  }, [playing, n]);

  // No pause button: the slideshow holds still while hovered or focused instead.
  const hold = { onMouseEnter: () => setPlaying(false), onMouseLeave: () => setPlaying(true), onFocus: () => setPlaying(false), onBlur: () => setPlaying(true) };

  return (
    <section aria-roledescription="carousel" aria-label="Featured banners" className="relative isolate overflow-hidden bg-navy text-white" {...hold}>
      <div className="relative min-h-[clamp(420px,62vh,640px)]">
        {banners.map((b, idx) => {
          // One visible h1 per page: the slide on screen carries it.
          const Title = idx === i ? "h1" : "h2";
          return (
            <div
              key={b.id}
              aria-hidden={idx !== i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${idx + 1} of ${n}`}
              className={`absolute inset-0 overflow-clip transition-[opacity,visibility] duration-700 ${idx === i ? "visible opacity-100" : "pointer-events-none invisible opacity-0"}`}
            >
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={idx === i ? `img-on-${i}` : "img-off"}
                  src={b.imageUrl}
                  alt=""
                  className={`absolute inset-0 h-full w-full object-cover ${idx === i ? "kenburns" : ""}`}
                  {...(idx === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
                />
              ) : (
                <div className="ph absolute inset-0" />
              )}
              {/* Image-only banner; the title stays for screen readers and SEO. */}
              {b.title && <Title className="sr-only">{b.title}</Title>}
            </div>
          );
        })}
      </div>
      {n > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-10 mx-auto flex max-w-[1280px] items-center gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-2">
            {banners.map((b, idx) => (
              <button key={b.id} onClick={() => setI(idx)} aria-label={`Go to slide ${idx + 1}`} aria-current={idx === i} className="flex h-6 items-center">
                <span className={`block h-2 rounded-full transition-all duration-500 [transition-timing-function:var(--ease-out)] ${idx === i ? "w-8 bg-white" : "w-2 bg-white/60 shadow"}`} />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
