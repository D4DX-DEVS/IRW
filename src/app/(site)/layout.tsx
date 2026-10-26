import { Footer } from "@/components/site/Footer";
import { Header } from "@/components/site/Header";
import { Motion } from "@/components/site/Motion";
import { PageTracker } from "@/components/site/PageTracker";

export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
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
