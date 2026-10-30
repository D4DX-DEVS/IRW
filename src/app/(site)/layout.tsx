import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { PageTracker } from "@/components/site/PageTracker";
import { jsonLd, organizationLd, websiteLd } from "@/lib/seo";
import { getSettings } from "@/lib/settings";

// Public pages are cached (ISR) and rebuilt when the admin changes what they show (see lib/cache.ts).
// Pages that read the query string render per request but still read from the cached queries.
export const revalidate = 3600;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(organizationLd(settings), websiteLd(settings)) }} />
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <PageTracker />
      <Motion />
    </>
  );
}
