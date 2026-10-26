import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SitePagination } from "@/components/site/parts";
import { PhotoGrid } from "@/components/site/Lightbox";
import { db } from "@/lib/db";
import { pageParam, strParam } from "@/lib/utils";

export const metadata: Metadata = { title: "Image Gallery", description: "Photos from IRW rescues, relief camps, trainings and honours." };
const PAGE_SIZE = 24;

export default async function ImagesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const albumSlug = strParam(sp.album);
  const albums = await db.album.findMany({ orderBy: { sort: "asc" }, include: { _count: { select: { photos: true } } } });
  const active = albums.find((a) => a.slug === albumSlug);
  const where = active ? { albumId: active.id } : {};
  const total = await db.photo.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(pageParam(sp.page), totalPages);
  const photos = await db.photo.findMany({ where, orderBy: [{ createdAt: "desc" }, { sort: "asc" }], skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE });
  const chip = (on: boolean) => `inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold transition-[background-color,color,transform] duration-200 active:scale-95 ${on ? "bg-navy text-white" : "bg-white hover:bg-tint"}`;

  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Gallery" }, { label: "Images" }]} title="Image Gallery" intro="Moments from rescues, relief camps, trainings and honours. Click any photo to view it large." />
      <section className="mx-auto flex max-w-[1280px] flex-col gap-7 px-4 pb-24 pt-12 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Albums" className="flex flex-wrap gap-2">
            <Link href="/images" className={chip(!active)}>All</Link>
            {albums.map((a) => (
              <Link key={a.id} href={`/images?album=${a.slug}`} className={chip(active?.id === a.id)}>
                {a.name} <span className="ml-1.5 opacity-60">{a._count.photos}</span>
              </Link>
            ))}
          </nav>
          <span className="text-sm text-body">{total} photos</span>
        </div>
        {photos.length === 0 ? <p className="surface p-10 text-center text-body">No photos in this album yet.</p> : <PhotoGrid photos={photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption }))} />}
        <SitePagination page={page} totalPages={totalPages} basePath="/images" params={active ? { album: active.slug } : {}} />
      </section>
    </>
  );
}
