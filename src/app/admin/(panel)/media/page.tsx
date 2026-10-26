import Link from "next/link";
import { DataPagination } from "@/components/shared/DataPagination";
import { PageHeader } from "@/components/shared/states";
import { MediaImages } from "@/components/admin/MediaImages";
import { MediaVideos } from "@/components/admin/MediaVideos";
import { db } from "@/lib/db";
import { pageParam, strParam } from "@/lib/utils";

export const metadata = { title: "Gallery & Videos" };

export default async function MediaPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const tab = strParam(sp.tab) === "videos" ? "videos" : "images";
  const tabCls = (on: boolean) => `rounded-lg px-4 py-2.5 text-sm font-semibold ${on ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`;

  let body: React.ReactNode;
  if (tab === "videos") {
    const videos = await db.video.findMany({ orderBy: [{ featured: "desc" }, { createdAt: "desc" }] });
    body = <MediaVideos videos={videos.map((v) => ({ id: v.id, title: v.title, youtubeUrl: v.youtubeUrl, description: v.description, featured: v.featured }))} />;
  } else {
    const albums = await db.album.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { photos: true } } } });
    const active = albums.find((a) => a.id === strParam(sp.album)) ?? albums[0] ?? null;
    const pageSize = [10, 20, 50, 100].includes(Number(strParam(sp.pageSize))) ? Number(strParam(sp.pageSize)) : 20;
    const total = active?._count.photos ?? 0;
    const page = Math.min(pageParam(sp.page), Math.max(1, Math.ceil(total / pageSize)));
    const photos = active ? await db.photo.findMany({ where: { albumId: active.id }, orderBy: [{ sort: "asc" }, { createdAt: "desc" }], skip: (page - 1) * pageSize, take: pageSize }) : [];
    body = (
      <>
        <MediaImages
          albums={albums.map((a) => ({ id: a.id, name: a.name, count: a._count.photos }))}
          active={active ? { id: active.id, name: active.name, count: active._count.photos } : null}
          photos={photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption }))}
        />
        {active && total > 0 && <div className="card rounded-[18px]"><DataPagination page={page} pageSize={pageSize} total={total} /></div>}
      </>
    );
  }

  return (
    <>
      <PageHeader
        crumb="Content / Gallery & Videos"
        title="Gallery & Videos"
        actions={
          <nav aria-label="Media type" className="inline-flex gap-1 rounded-xl bg-bg p-1">
            <Link href="/admin/media" className={tabCls(tab === "images")}>Images</Link>
            <Link href="/admin/media?tab=videos" className={tabCls(tab === "videos")}>Videos</Link>
          </nav>
        }
      />
      {body}
    </>
  );
}
