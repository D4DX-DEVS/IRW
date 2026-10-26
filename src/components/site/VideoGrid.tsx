"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { Play, X } from "lucide-react";
import { useState } from "react";

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  ytId: string;
  featured: boolean;
}

function Thumb({ v, size }: { v: VideoItem; size: "lg" | "sm" }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden bg-royal ${size === "lg" ? "min-h-[320px]" : "h-[220px]"}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`https://i.ytimg.com/vi/${v.ytId}/hqdefault.jpg`} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <span className={`relative flex items-center justify-center rounded-full bg-red text-white shadow-lg transition group-hover:scale-110 ${size === "lg" ? "h-[72px] w-[72px]" : "h-14 w-14"}`}>
        <Play size={size === "lg" ? 28 : 22} fill="currentColor" />
      </span>
    </div>
  );
}

export function VideoGrid({ videos }: { videos: VideoItem[] }) {
  const [cur, setCur] = useState<VideoItem | null>(null);
  const featured = videos.find((v) => v.featured) ?? videos[0];
  const rest = videos.filter((v) => v.id !== featured?.id);

  return (
    <>
      {featured && (
        <button onClick={() => setCur(featured)} className="surface group grid overflow-hidden rounded-3xl text-left md:grid-cols-2" aria-label={`Play ${featured.title}`}>
          <Thumb v={featured} size="lg" />
          <div className="flex flex-col justify-center gap-4 p-8 sm:p-11">
            <span className="self-start rounded-full bg-red px-3 py-1 text-[13px] font-bold text-white">Featured</span>
            <h2 className="text-[clamp(24px,3vw,32px)] font-extrabold leading-tight group-hover:text-red">{featured.title}</h2>
            {featured.description && <p className="leading-relaxed text-muted">{featured.description}</p>}
          </div>
        </button>
      )}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((v) => (
          <button key={v.id} onClick={() => setCur(v)} className="surface group flex flex-col overflow-hidden text-left" aria-label={`Play ${v.title}`}>
            <Thumb v={v} size="sm" />
            <div className="flex flex-col gap-1.5 p-[22px]">
              <h3 className="text-[19px] font-bold group-hover:text-red">{v.title}</h3>
              {v.description && <span className="line-clamp-2 text-sm text-muted">{v.description}</span>}
            </div>
          </button>
        ))}
      </div>
      <Dialog.Root open={!!cur} onOpenChange={(o) => !o && setCur(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="anim-fade fixed inset-0 z-[90] bg-[#060c16]/90" />
          <Dialog.Content className="anim-pop fixed left-1/2 top-1/2 z-[91] flex w-[min(960px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-3 outline-none">
            <div className="flex items-center justify-between text-white">
              <Dialog.Title className="text-[17px] font-bold">{cur?.title}</Dialog.Title>
              <Dialog.Close aria-label="Close video" className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/30 hover:bg-white/10"><X size={20} /></Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Video player</Dialog.Description>
            {cur && (
              <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
                <iframe
                  className="h-full w-full"
                  src={`https://www.youtube-nocookie.com/embed/${cur.ytId}?autoplay=1&rel=0`}
                  title={cur.title}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
