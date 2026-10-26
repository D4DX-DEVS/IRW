"use client";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { type CSSProperties, useState } from "react";

export interface LightPhoto {
  id: string;
  url: string;
  caption: string;
}

export function PhotoGrid({ photos }: { photos: LightPhoto[] }) {
  const [idx, setIdx] = useState<number | null>(null);
  const open = idx !== null;
  const cur = open ? photos[idx] : null;
  const step = (d: number) => setIdx((i) => (i === null ? i : (i + d + photos.length) % photos.length));

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3.5 [grid-auto-rows:220px]">
        {photos.map((p, i) => (
          <button
            key={p.id}
            data-reveal="scale"
            style={{ "--i": i % 8 } as CSSProperties}
            onClick={() => setIdx(i)}
            aria-label={`Open photo: ${p.caption || i + 1}`}
            className="zoom group relative cursor-zoom-in rounded-2xl active:scale-[0.98]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption} loading="lazy" className="h-full w-full object-cover" />
            {p.caption && <span className="absolute inset-x-0 bottom-0 translate-y-1 bg-gradient-to-t from-black/75 to-transparent p-3 text-left text-sm text-white opacity-90 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100">{p.caption}</span>}
          </button>
        ))}
      </div>
      <Dialog.Root open={open} onOpenChange={(o) => !o && setIdx(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="anim-fade fixed inset-0 z-[90] bg-[#060c16]/90" />
          <Dialog.Content
            onKeyDown={(e) => {
              if (e.key === "ArrowRight") step(1);
              if (e.key === "ArrowLeft") step(-1);
            }}
            className="anim-pop fixed left-1/2 top-1/2 z-[91] flex w-[min(1040px,calc(100%-24px))] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 outline-none"
          >
            <div className="flex items-center justify-between text-white">
              <Dialog.Title className="text-[17px] font-bold">{cur?.caption || "Photo"}</Dialog.Title>
              <Dialog.Close aria-label="Close viewer" className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-white/30 hover:bg-white/10">
                <X size={20} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Photo viewer. Use arrow keys to move between photos.</Dialog.Description>
            {cur && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cur.url} alt={cur.caption} className="max-h-[70vh] w-full rounded-2xl bg-black/30 object-contain" />
            )}
            <div className="flex items-center justify-between text-sm text-[#c9d2e0]">
              <button onClick={() => step(-1)} className="btn !min-h-10 border-0 bg-white/10 text-white hover:bg-white/20"><ChevronLeft size={16} /> Previous</button>
              <span>{(idx ?? 0) + 1} / {photos.length}</span>
              <button onClick={() => step(1)} className="btn !min-h-10 border-0 bg-white/10 text-white hover:bg-white/20">Next <ChevronRight size={16} /></button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
