import type { Metadata } from "next";
import { Anek_Malayalam, Noto_Sans_Malayalam, Poppins } from "next/font/google";
import { SITE_DESCRIPTION, siteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/settings";
import "./globals.css";

// English: Poppins. Malayalam: Anek Malayalam for titles, Noto Sans Malayalam for everything else
// (both variable, so every weight is real, not synthesized). Only their Malayalam subset is loaded.
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
const malayalamTitle = Anek_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-anek-ml",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const { faviconUrl, logoUrl } = await getSettings().catch(() => ({ faviconUrl: "", logoUrl: "" }));
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: "IRW Kerala — Ideal Relief Wing | Disaster Rescue & Relief NGO", template: "%s · IRW Kerala" },
    description: SITE_DESCRIPTION,
    applicationName: "IRW Kerala",
    keywords: ["IRW Kerala", "Ideal Relief Wing", "disaster management Kerala", "rescue volunteers Kerala", "flood relief Kerala", "landslide rescue", "NGO Malappuram", "disaster relief NGO India"],
    authors: [{ name: "Ideal Relief Wing Kerala" }],
    formatDetection: { telephone: false },
    openGraph: {
      type: "website",
      siteName: "IRW Kerala — Ideal Relief Wing",
      locale: "en_IN",
      ...(logoUrl ? { images: [{ url: logoUrl, alt: "IRW Kerala logo" }] } : {}),
    },
    twitter: { card: "summary_large_image" },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    ...(faviconUrl ? { icons: { icon: faviconUrl, apple: faviconUrl } } : {}),
  };
}

// Turns on the motion styles before first paint. If the motion script never starts, show everything.
const MOTION_BOOT = `document.documentElement.classList.add("js");setTimeout(function(){if(!window.__motion)document.querySelectorAll("[data-reveal],[data-shutter],[data-draw]").forEach(function(e){e.classList.add("is-in")})},3000)`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${poppins.variable} ${malayalam.variable} ${malayalamTitle.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: MOTION_BOOT }} />
        {children}
      </body>
    </html>
  );
}
