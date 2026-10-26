"use client";
import { Check, FolderPlus, Loader2, Pencil, Trash2, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toaster";
import { createAlbum, deleteAlbum, deletePhotos, renameAlbum, uploadPhotos } from "@/app/admin/actions/media";

export interface AlbumLite { id: string; name: string; count: number }
export interface PhotoLite { id: string; url: string; caption: string }

export function MediaImages({ albums, active, photos }: { albums: AlbumLite[]; active: AlbumLite | null; photos: PhotoLite[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [uploading, setUploading] = useState(0);
  const [confirm, setConfirm] = useState<"photos" | "album" | null>(null);
  const [drawer, setDrawer] = useState<"new" | "rename" | null>(null);
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const refresh = () => start(() => router.refresh());

  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const onFiles = async (files: FileList | null) => {
    if (!files?.length || !active) return;
    const fd = new FormData();
    [...files].forEach((f) => fd.append("files", f));
    setUploading(files.length);
    const res = await uploadPhotos(active.id, fd);
    setUploading(0);
    if (fileRef.current) fileRef.current.value = "";
    toast(res.ok ? res.message ?? "Uploaded" : res.error, { tone: res.ok ? "ok" : "error" });
    refresh();
  };

  const saveAlbum = async () => {
    setErr("");
    const res = drawer === "rename" && active ? await renameAlbum(active.id, { name }) : await createAlbum({ name });
    if (!res.ok) return setErr(res.fieldErrors?.name ?? res.error);
    setDrawer(null);
    setName("");
    toast(res.message ?? "Saved");
    if (drawer === "new" && "data" in res && res.data) router.push(`/admin/media?album=${(res.data as { id: string }).id}`);
    else refresh();
  };

  return (
    <div className="flex flex-wrap items-start gap-5">
      <aside className="card flex min-w-[240px] flex-[1_1_240px] flex-col gap-1 rounded-[18px] p-3.5">
        <div className="flex items-center justify-between px-1.5 pb-2.5 pt-1">
          <span className="text-[15px] font-bold">Albums</span>
          <button aria-label="New album" className="flex h-[34px] w-[34px] items-center justify-center rounded-lg border border-line2 hover:border-navy" onClick={() => { setName(""); setErr(""); setDrawer("new"); }}><FolderPlus size={16} /></button>
        </div>
        {albums.length === 0 && <p className="px-2 py-4 text-sm text-muted">No albums yet. Create one to start uploading.</p>}
        {albums.map((a) => (
          <Link key={a.id} href={`/admin/media?album=${a.id}`} aria-current={active?.id === a.id ? "page" : undefined} className={`flex min-h-11 items-center justify-between gap-2 rounded-[10px] px-3 text-sm ${active?.id === a.id ? "bg-navy font-semibold text-white" : "hover:bg-bg2"}`}>
            <span className="truncate">{a.name}</span>
            <span className="text-xs opacity-70">{a.count}</span>
          </Link>
        ))}
      </aside>

      <section className="flex min-w-0 flex-[999_1_520px] flex-col gap-4">
        {!active ? (
          <div className="card rounded-[18px] p-10 text-center text-muted">Select or create an album.</div>
        ) : (
          <>
            <button onClick={() => fileRef.current?.click()} disabled={uploading > 0} className="flex flex-col items-center gap-2.5 rounded-[18px] border-2 border-dashed border-line2 bg-white p-8 hover:border-navy disabled:opacity-70">
              <span className="flex h-[52px] w-[52px] items-center justify-center rounded-[14px] bg-red-tint text-red">{uploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}</span>
              <span className="text-base font-bold">{uploading ? `Uploading ${uploading} photo${uploading > 1 ? "s" : ""}…` : "Click to upload photos"}</span>
              <span className="text-[13px] text-muted">JPG, PNG, WebP or GIF · up to 12 MB each · 20 files at once</span>
            </button>
            <input ref={fileRef} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" aria-label="Upload photos" onChange={(e) => onFiles(e.target.files)} />

            <div className="card flex flex-col gap-3.5 rounded-[18px] p-[18px]">
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-col"><span className="text-[17px] font-bold">{active.name}</span><span className="text-[13px] text-muted">{active.count} photos · click to select</span></div>
                <div className="flex flex-wrap gap-2">
                  {sel.size > 0 && <button className="btn !min-h-10 bg-red-100 text-red-700 hover:bg-red-200" onClick={() => setConfirm("photos")}><Trash2 size={15} /> Delete {sel.size}</button>}
                  <button className="btn btn-ghost !min-h-10" onClick={() => { setName(active.name); setErr(""); setDrawer("rename"); }}><Pencil size={15} /> Rename</button>
                  <button className="btn btn-ghost !min-h-10 text-red-700" onClick={() => setConfirm("album")}><Trash2 size={15} /> Delete album</button>
                </div>
              </div>
              {photos.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">This album is empty.</p>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
                  {photos.map((p) => {
                    const on = sel.has(p.id);
                    return (
                      <button key={p.id} onClick={() => toggle(p.id)} aria-pressed={on} aria-label={`Photo ${p.caption}`} className={`relative h-[150px] overflow-hidden rounded-xl outline-offset-2 ${on ? "outline outline-[3px] outline-red" : ""}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.caption} loading="lazy" className="h-full w-full object-cover" />
                        <span className={`absolute left-2 top-2 flex h-[22px] w-[22px] items-center justify-center rounded-md border-2 border-white text-white ${on ? "bg-red" : "bg-black/25"}`}>{on && <Check size={13} />}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        open={confirm === "photos"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Delete ${sel.size} photo${sel.size > 1 ? "s" : ""}?`}
        description="They are removed from the album and the public gallery, and the files are deleted from storage. This cannot be undone."
        confirmLabel="Delete photos"
        onConfirm={async () => { await deletePhotos([...sel]); setSel(new Set()); toast("Photos deleted"); refresh(); }}
      />
      <ConfirmDialog
        open={confirm === "album"}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={`Delete album “${active?.name ?? ""}”?`}
        description={`All ${active?.count ?? 0} photos in it will be permanently deleted from the gallery and storage.`}
        confirmLabel="Delete album"
        requireText="DELETE"
        onConfirm={async () => { if (active) await deleteAlbum(active.id); toast("Album deleted"); router.push("/admin/media"); refresh(); }}
      />
      <Drawer open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)} title={drawer === "rename" ? "Rename album" : "New album"}>
        <label className="flex flex-col gap-2 text-[13px] font-semibold">
          Album name
          <input className="input font-normal" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!err} placeholder="e.g. Flood relief 2025" autoFocus />
          {err && <span role="alert" className="font-medium text-red">{err}</span>}
        </label>
        <div className="mt-auto flex justify-end gap-2.5 border-t border-line pt-4">
          <button className="btn btn-ghost" onClick={() => setDrawer(null)}>Cancel</button>
          <button className="btn btn-navy" onClick={saveAlbum}>Save album</button>
        </div>
      </Drawer>
    </div>
  );
}
