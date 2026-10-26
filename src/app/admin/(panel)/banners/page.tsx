import { BannersManager } from "@/components/admin/BannersManager";
import { PageHeader } from "@/components/shared/states";
import { db } from "@/lib/db";

export const metadata = { title: "Home banners" };

export default async function AdminBannersPage() {
  const banners = await db.banner.findMany({ orderBy: [{ sort: "asc" }, { createdAt: "asc" }] });
  return (
    <>
      <PageHeader crumb="Content / Home banners" title="Home banners" />
      <BannersManager banners={banners.map((b) => ({ id: b.id, title: b.title, subtitle: b.subtitle, imageUrl: b.imageUrl, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref, active: b.active }))} />
    </>
  );
}
