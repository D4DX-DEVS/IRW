"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toaster";
import { publicationSchema, type PublicationInput } from "@/lib/validation";
import { deletePublication, savePublication } from "@/app/admin/actions/publications";

export interface PubRow { id: string; title: string; category: string; year: number; fileUrl: string; size: string; showInMenu: boolean }

const CATS = [{ value: "ANNUAL", label: "Annual report" }, { value: "RESCUE", label: "Rescue report" }, { value: "OTHER", label: "Other" }];

export function PublicationsTable({ rows }: { rows: PubRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileErr, setFileErr] = useState("");
  const [edit, setEdit] = useState<PubRow | "new" | null>(null);
  const [del, setDel] = useState<PubRow | null>(null);
  const refresh = () => start(() => router.refresh());

  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<PublicationInput>({ resolver: zodResolver(publicationSchema) });
  const open = (p: PubRow | "new") => {
    setFile(null);
    setFileErr("");
    reset(p === "new" ? { title: "", category: "ANNUAL", year: new Date().getFullYear(), showInMenu: true } : { title: p.title, category: p.category as PublicationInput["category"], year: p.year, showInMenu: p.showInMenu });
    setEdit(p);
  };
  const submit = handleSubmit(async (values) => {
    const fd = new FormData();
    fd.set("json", JSON.stringify(values));
    if (edit && edit !== "new") fd.set("id", edit.id);
    if (file) fd.set("file", file);
    const res = await savePublication(fd);
    if (!res.ok) {
      setFileErr(res.fieldErrors?.file ?? "");
      for (const [k, m] of Object.entries(res.fieldErrors ?? {})) if (k !== "file") setError(k as keyof PublicationInput, { message: m });
      return toast(res.error, { tone: "error" });
    }
    toast(res.message ?? "Saved");
    setEdit(null);
    refresh();
  });

  const existing = edit && edit !== "new" ? edit : null;
  return (
    <>
      <div className="flex justify-end border-b border-line p-4"><button className="btn btn-red" onClick={() => open("new")}><Plus size={16} /> Upload publication</button></div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-sm">
          <thead><tr className="bg-[#f7fafd] text-left text-xs uppercase tracking-wider text-muted"><th className="px-4 py-3 font-semibold">Document</th><th className="hidden px-2 py-3 font-semibold sm:table-cell">Category</th><th className="px-2 py-3 font-semibold">Year</th><th className="hidden px-2 py-3 font-semibold md:table-cell">In menu</th><th className="w-24 px-4 py-3"><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t border-line">
                <td className="px-4 py-3.5">
                  <a href={p.fileUrl} target="_blank" rel="noopener" className="flex items-center gap-3 hover:text-red">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-[9px] bg-red-tint text-red"><FileText size={18} /></span>
                    <span className="flex min-w-0 flex-col"><span className="truncate font-semibold">{p.title}</span><span className="text-xs text-muted">PDF · {p.size}</span></span>
                  </a>
                </td>
                <td className="hidden px-2 py-3.5 text-muted sm:table-cell">{CATS.find((c) => c.value === p.category)?.label}</td>
                <td className="px-2 py-3.5 tabular-nums">{p.year}</td>
                <td className="hidden px-2 py-3.5 md:table-cell"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.showInMenu ? "bg-green-100 text-green-800" : "bg-bg2 text-muted"}`}>{p.showInMenu ? "Shown" : "Hidden"}</span></td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <button aria-label={`Edit ${p.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-bg2" onClick={() => open(p)}><Pencil size={17} /></button>
                  <button aria-label={`Delete ${p.title}`} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-700" onClick={() => setDel(p)}><Trash2 size={17} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Drawer open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={existing ? "Edit publication" : "Upload publication"}>
        <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
          <button type="button" onClick={() => fileRef.current?.click()} className="flex flex-col items-center gap-1.5 rounded-[14px] border-2 border-dashed border-line2 p-5 text-center hover:border-navy">
            <Upload size={20} className="text-red" />
            <span className="font-bold">{file ? file.name : existing ? "Replace PDF (optional)" : "Choose a PDF"}</span>
            <span className="text-xs text-muted">Up to 25 MB</span>
          </button>
          <input ref={fileRef} type="file" accept="application/pdf" className="sr-only" aria-label="Upload PDF" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFileErr(""); }} />
          {fileErr && <span role="alert" className="text-[13px] font-medium text-red">{fileErr}</span>}
          <label className="flex flex-col gap-2 text-[13px] font-semibold">Title<input className="input font-normal" aria-invalid={!!errors.title} placeholder="Annual Report 2024 – 2025" {...register("title")} />{errors.title && <span role="alert" className="font-medium text-red">{errors.title.message}</span>}</label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-2 text-[13px] font-semibold">Category<Controller control={control} name="category" render={({ field }) => <Select ariaLabel="Category" value={field.value} onValueChange={field.onChange} options={CATS} />} /></div>
            <label className="flex flex-col gap-2 text-[13px] font-semibold">Year<input className="input font-normal" type="number" {...register("year")} />{errors.year && <span role="alert" className="font-medium text-red">{errors.year.message}</span>}</label>
          </div>
          <div className="flex items-center justify-between text-sm font-semibold">Show in header “Publications” menu<Controller control={control} name="showInMenu" render={({ field }) => <Switch label="Show in menu" checked={!!field.value} onCheckedChange={field.onChange} />} /></div>
          <div className="mt-auto flex justify-end gap-2.5 border-t border-line pt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save publication"}</button>
          </div>
        </form>
      </Drawer>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={`Delete “${del?.title ?? ""}”?`} description="The PDF is removed from the Publications page and header menu, and the file deleted from storage." confirmLabel="Delete publication"
        onConfirm={async () => { await deletePublication(del!.id); toast("Publication deleted"); refresh(); }} />
    </>
  );
}
