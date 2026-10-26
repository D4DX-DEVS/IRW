import type { Metadata } from "next";
import { Noto_Sans_Malayalam, Poppins } from "next/font/google";
import { getSettings } from "@/lib/settings";
import "./globals.css";

// English: Poppins. Malayalam: Noto Sans Malayalam (variable, so every weight is real, not synthesized).
const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});
const malayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-malayalam",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl } = await getSettings().catch(() => ({ faviconUrl: "" }));
  return {
    title: { default: "IRW Kerala — Ideal Relief Wing", template: "%s · IRW Kerala" },
    description:
      "Ideal Relief Wing Kerala — a registered NGO (est. 1992) providing trained volunteer rescue, relief, rehabilitation and reconstruction services.",
    ...(faviconUrl ? { icons: { icon: faviconUrl, apple: faviconUrl } } : {}),
  };
}

// Turns on the motion styles before first paint. If the motion script never starts, show everything.
const MOTION_BOOT = `document.documentElement.classList.add("js");setTimeout(function(){if(!window.__motion)document.querySelectorAll("[data-reveal],[data-shutter],[data-draw]").forEach(function(e){e.classList.add("is-in")})},3000)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${malayalam.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
        {children}
      </body>
    </html>
  );
}
