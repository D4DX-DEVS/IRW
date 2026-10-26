"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toaster";
import { EmptyState } from "@/components/shared/states";
import { youtubeId } from "@/lib/utils";
import { videoSchema, type VideoInput } from "@/lib/validation";
import { deleteVideo, saveVideo } from "@/app/admin/actions/media";

export interface VideoRow { id: string; title: string; youtubeUrl: string; description: string; featured: boolean }

export function MediaVideos({ videos }: { videos: VideoRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, start] = useTransition();
  const [edit, setEdit] = useState<VideoRow | "new" | null>(null);
  const [del, setDel] = useState<VideoRow | null>(null);
  const refresh = () => start(() => router.refresh());

  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<VideoInput>({ resolver: zodResolver(videoSchema) });
  const open = (v: VideoRow | "new") => {
    reset(v === "new" ? { title: "", youtubeUrl: "", description: "", featured: false } : { title: v.title, youtubeUrl: v.youtubeUrl, description: v.description, featured: v.featured });
    setEdit(v);
  };
  const submit = handleSubmit(async (values) => {
    const res = await saveVideo(edit === "new" || !edit ? null : edit.id, values);
    if (!res.ok) {
      for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof VideoInput, { message: m });
      return toast(res.error, { tone: "error" });
    }
    toast(res.message ?? "Saved");
    setEdit(null);
    refresh();
  });

  return (
    <div className="card rounded-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <p className="text-sm text-muted">Videos are YouTube links shown on the public Video page.</p>
        <button className="btn btn-red" onClick={() => open("new")}><Plus size={16} /> Add video</button>
      </div>
      {videos.length === 0 ? (
        <EmptyState title="No videos yet" hint="Paste a YouTube link to add the first one." />
      ) : (
        <ul>
          {videos.map((v) => {
            const id = youtubeId(v.youtubeUrl);
            return (
              <li key={v.id} className="flex flex-wrap items-center gap-4 border-t border-line p-4 first:border-0">
                {id ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`https://i.ytimg.com/vi/${id}/mqdefault.jpg`} alt="" className="h-[60px] w-[106px] flex-none rounded-lg object-cover" />
                ) : <div className="ph h-[60px] w-[106px] flex-none rounded-lg" />}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-semibold">{v.title} {v.featured && <span className="ml-1.5 rounded-full bg-red-tint px-2 py-0.5 text-xs font-bold text-red-dark">Featured</span>}</span>
                  <span className="truncate text-xs text-muted">{v.youtubeUrl}</span>
                </div>
                <button aria-label={`Edit ${v.title}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-bg2" onClick={() => open(v)}><Pencil size={17} /></button>
                <button aria-label={`Delete ${v.title}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-700" onClick={() => setDel(v)}><Trash2 size={17} /></button>
              </li>
            );
          })}
        </ul>
      )}
      <Drawer open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={edit === "new" ? "Add video" : "Edit video"}>
        <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
          <label className="flex flex-col gap-2 text-[13px] font-semibold">Title<input className="input font-normal" aria-invalid={!!errors.title} {...register("title")} />{errors.title && <span role="alert" className="font-medium text-red">{errors.title.message}</span>}</label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold">YouTube link<input className="input font-normal" placeholder="https://www.youtube.com/watch?v=…" aria-invalid={!!errors.youtubeUrl} {...register("youtubeUrl")} />{errors.youtubeUrl && <span role="alert" className="font-medium text-red">{errors.youtubeUrl.message}</span>}</label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold">Description<textarea className="input min-h-[90px] font-normal" rows={3} {...register("description")} /></label>
          <div className="flex items-center justify-between text-sm font-semibold">Feature at top of page<Controller control={control} name="featured" render={({ field }) => <Switch label="Featured" checked={!!field.value} onCheckedChange={field.onChange} />} /></div>
          <div className="mt-auto flex justify-end gap-2.5 border-t border-line pt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save video"}</button>
          </div>
        </form>
      </Drawer>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={`Delete “${del?.title ?? ""}”?`} description="The video is removed from the public Video page. The YouTube video itself is not affected." confirmLabel="Delete video"
        onConfirm={async () => { await deleteVideo(del!.id); toast("Video deleted"); refresh(); }} />
    </div>
  );
}
