import type { Metadata } from "next";
import { PageHero } from "@/components/site/parts";
import { VideoGrid } from "@/components/site/VideoGrid";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { youtubeId } from "@/lib/utils";

export const metadata: Metadata = { title: "Videos", description: "Field footage, safety trainings and recognition of IRW volunteers." };

export default async function VideoPage() {
  const [rows, s] = await Promise.all([db.video.findMany({ orderBy: [{ featured: "desc" }, { sort: "asc" }, { createdAt: "desc" }] }), getSettings()]);
  const videos = rows.flatMap((v) => {
    const ytId = youtubeId(v.youtubeUrl);
    return ytId ? [{ id: v.id, title: v.title, description: v.description, ytId, featured: v.featured }] : [];
  });
  return (
    <>
      <PageHero crumbs={[{ href: "/", label: "Home" }, { label: "Gallery" }, { label: "Video" }]} title="Videos" intro="Field footage, safety trainings and recognition of IRW volunteers." />
      <section className="mx-auto flex max-w-[1280px] flex-col gap-8 px-4 pb-24 pt-14 sm:px-8">
        {videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <div className="surface flex flex-col items-center gap-5 p-10 text-center">
            <p className="text-body">Watch our field footage and training videos on YouTube.</p>
            {s.youtube && <a href={s.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-red">Open IRW Kerala on YouTube</a>}
          </div>
        )}
      </section>
    </>
  );
}
