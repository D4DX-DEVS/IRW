"use client";
import { useEffect } from "react";

const SELECTOR = "[data-reveal]:not(.is-in), [data-shutter]:not(.is-in), [data-draw]:not(.is-in)";

/** Reveals [data-reveal], [data-shutter] and [data-draw] elements once, as they scroll into view. */
export function Motion() {
  useEffect(() => {
    (window as unknown as { __motion?: boolean }).__motion = true;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );
    const scan = () => document.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    scan();
    // Client navigation swaps the page content; pick up the new elements.
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
  return null;
}
