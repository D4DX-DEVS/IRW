"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toaster";
import { EmptyState } from "@/components/shared/states";
import { bannerSchema, type BannerInput } from "@/lib/validation";
import { deleteBanner, reorderBanners, saveBanner, setBannerActive } from "@/app/admin/actions/banners";

export interface BannerRow { id: string; title: string; subtitle: string; imageUrl: string | null; ctaLabel: string; ctaHref: string; active: boolean }

export function BannersManager({ banners }: { banners: BannerRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [edit, setEdit] = useState<BannerRow | "new" | null>(null);
  const [del, setDel] = useState<BannerRow | null>(null);
  const refresh = () => start(() => router.refresh());

  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<BannerInput>({ resolver: zodResolver(bannerSchema) });
  const open = (b: BannerRow | "new") => {
    setFile(null);
    setRemoveImage(false);
    reset(b === "new" ? { title: "", subtitle: "", ctaLabel: "", ctaHref: "", active: true } : { title: b.title, subtitle: b.subtitle, ctaLabel: b.ctaLabel, ctaHref: b.ctaHref, active: b.active });
    setEdit(b);
  };
  const editing = edit && edit !== "new" ? edit : null;
  const preview = file ? URL.createObjectURL(file) : removeImage ? null : editing?.imageUrl ?? null;

  const submit = handleSubmit(async (values) => {
    const fd = new FormData();
    fd.set("json", JSON.stringify(values));
    if (editing) fd.set("id", editing.id);
    if (file) fd.set("image", file);
    if (removeImage) fd.set("removeImage", "1");
    const res = await saveBanner(fd);
    if (!res.ok) {
      for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof BannerInput, { message: m });
      return toast(res.error, { tone: "error" });
    }
    toast(res.message ?? "Saved");
    setEdit(null);
    refresh();
  });
  const move = async (i: number, d: number) => {
    const ids = banners.map((b) => b.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    await reorderBanners(ids);
    refresh();
  };

  return (
    <div className="card rounded-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <p className="text-sm text-muted">Active banners rotate at the top of the home page. With none active, the default hero is shown.</p>
        <button className="btn btn-red" onClick={() => open("new")}><Plus size={16} /> Add banner</button>
      </div>
      {banners.length === 0 ? (
        <EmptyState title="No banners yet" hint="Add a banner to replace the default home page hero." />
      ) : (
        <ul className="flex flex-col gap-3 p-4">
          {banners.map((b, i) => (
            <li key={b.id} className="flex flex-wrap items-center gap-3.5 rounded-xl border border-line bg-white p-3 hover:border-line2">
              <div className="flex flex-col">
                <button aria-label={`Move ${b.title} up`} disabled={i === 0} className="flex h-5 w-8 items-center justify-center text-muted hover:text-navy disabled:opacity-30" onClick={() => move(i, -1)}><ArrowUp size={15} /></button>
                <button aria-label={`Move ${b.title} down`} disabled={i === banners.length - 1} className="flex h-5 w-8 items-center justify-center text-muted hover:text-navy disabled:opacity-30" onClick={() => move(i, 1)}><ArrowDown size={15} /></button>
              </div>
              {b.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.imageUrl} alt="" className="h-[72px] w-[128px] flex-none rounded-lg object-cover" />
              ) : <div className="ph h-[72px] w-[128px] flex-none rounded-lg" />}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate font-bold">{b.title}</span>
                <span className="truncate text-[13px] text-muted">{b.subtitle || "No subtitle"}</span>
                {b.ctaLabel && <span className="truncate text-xs text-royal">{b.ctaLabel} → {b.ctaHref}</span>}
              </div>
              <div className="flex items-center gap-2 text-[13px] text-muted">
                {b.active ? "Live" : "Hidden"}
                <Switch label={`Show ${b.title} on site`} checked={b.active} onCheckedChange={async (v) => { await setBannerActive(b.id, v); toast(v ? "Banner is live" : "Banner hidden"); refresh(); }} />
              </div>
              <button aria-label={`Edit ${b.title}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-bg2" onClick={() => open(b)}><Pencil size={17} /></button>
              <button aria-label={`Delete ${b.title}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-700" onClick={() => setDel(b)}><Trash2 size={17} /></button>
            </li>
          ))}
        </ul>
      )}
      <Drawer open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={editing ? "Edit banner" : "Add banner"}>
        <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
          <div className="flex flex-col gap-2">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="Banner preview" className="h-[150px] w-full rounded-xl object-cover" />
            ) : <div className="ph flex h-[150px] items-center justify-center rounded-xl text-xs uppercase tracking-wider text-white/80">No image · navy background</div>}
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost flex-1 !min-h-10" onClick={() => fileRef.current?.click()}><ImagePlus size={16} /> {preview ? "Replace image" : "Upload image"}</button>
              {preview && <button type="button" aria-label="Remove image" className="btn btn-ghost !min-h-10 !px-3" onClick={() => { setFile(null); setRemoveImage(true); }}><Trash2 size={16} /></button>}
            </div>
            <span className="text-xs text-muted">Wide photo, at least 1600×700, works best. Max 12 MB.</span>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload banner image" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setRemoveImage(false); }} />
          </div>
          <label className="flex flex-col gap-2 text-[13px] font-semibold">Headline<input className="input font-normal" aria-invalid={!!errors.title} {...register("title")} />{errors.title && <span role="alert" className="font-medium text-red">{errors.title.message}</span>}</label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold">Subtitle<textarea className="input min-h-[80px] font-normal" rows={2} {...register("subtitle")} /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-[13px] font-semibold">Button label<input className="input font-normal" placeholder="e.g. Support our work" {...register("ctaLabel")} /></label>
            <label className="flex flex-col gap-2 text-[13px] font-semibold">Button link<input className="input font-normal" placeholder="/contact-us" aria-invalid={!!errors.ctaHref} {...register("ctaHref")} />{errors.ctaHref && <span role="alert" className="font-medium text-red">{errors.ctaHref.message}</span>}</label>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold">Show on home page<Controller control={control} name="active" render={({ field }) => <Switch label="Active" checked={!!field.value} onCheckedChange={field.onChange} />} /></div>
          <div className="mt-auto flex justify-end gap-2.5 border-t border-line pt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save banner"}</button>
          </div>
        </form>
      </Drawer>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={`Delete “${del?.title ?? ""}”?`} description="The banner is removed from the home page and its image deleted from storage." confirmLabel="Delete banner"
        onConfirm={async () => { await deleteBanner(del!.id); toast("Banner deleted"); refresh(); }} />
    </div>
  );
}
