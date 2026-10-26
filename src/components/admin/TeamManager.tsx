"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { useToast } from "@/components/ui/Toaster";
import { EmptyState } from "@/components/shared/states";
import { TEAM_GROUPS } from "@/lib/utils";
import { teamSchema, type TeamInput } from "@/lib/validation";
import { deleteMember, reorderMembers, saveMember, setMemberVisible } from "@/app/admin/actions/team";

export interface Member { id: string; name: string; designation: string; groupName: string; photoUrl: string | null; phone: string | null; visible: boolean }

export function TeamManager({ members, group, counts }: { members: Member[]; group: string; counts: Record<string, number> }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [edit, setEdit] = useState<Member | "new" | null>(null);
  const [del, setDel] = useState<Member | null>(null);
  const refresh = () => start(() => router.refresh());

  const { register, control, handleSubmit, reset, setError, formState: { errors, isSubmitting } } = useForm<TeamInput>({ resolver: zodResolver(teamSchema) });
  const open = (m: Member | "new") => {
    setPhoto(null);
    reset(m === "new" ? { name: "", designation: "", groupName: group as TeamInput["groupName"], phone: "", visible: true } : { name: m.name, designation: m.designation, groupName: m.groupName as TeamInput["groupName"], phone: m.phone ?? "", visible: m.visible });
    setEdit(m);
  };
  const submit = handleSubmit(async (values) => {
    const fd = new FormData();
    fd.set("json", JSON.stringify(values));
    if (edit && edit !== "new") fd.set("id", edit.id);
    if (photo) fd.set("photo", photo);
    const res = await saveMember(fd);
    if (!res.ok) {
      for (const [k, m] of Object.entries(res.fieldErrors ?? {})) setError(k as keyof TeamInput, { message: m });
      return toast(res.error, { tone: "error" });
    }
    toast(res.message ?? "Saved");
    setEdit(null);
    refresh();
  });
  const move = async (i: number, d: number) => {
    const ids = members.map((m) => m.id);
    [ids[i], ids[i + d]] = [ids[i + d], ids[i]];
    await reorderMembers(ids);
    refresh();
  };

  const editing = edit && edit !== "new" ? edit : null;
  return (
    <div className="card rounded-[18px]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
        <nav aria-label="Team group" className="inline-flex flex-wrap gap-1 rounded-xl bg-bg2 p-1">
          {Object.entries(TEAM_GROUPS).map(([k, l]) => (
            <Link key={k} href={`/admin/team?group=${k}`} aria-current={k === group ? "page" : undefined} className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold ${k === group ? "bg-white text-navy shadow-sm" : "text-muted hover:text-navy"}`}>
              {l} · {counts[k] ?? 0}
            </Link>
          ))}
        </nav>
        <button className="btn btn-red" onClick={() => open("new")}><Plus size={16} /> Add member</button>
      </div>
      {members.length === 0 ? (
        <EmptyState title="No members in this group" hint="Add the first member to show them on the public Our Team page." />
      ) : (
        <ul className="flex flex-col gap-2 p-4">
          {members.map((m, i) => (
            <li key={m.id} className="flex flex-wrap items-center gap-3.5 rounded-xl border border-line bg-white px-3.5 py-3 hover:border-line2">
              <div className="flex flex-col">
                <button aria-label={`Move ${m.name} up`} disabled={i === 0} className="flex h-5 w-8 items-center justify-center text-muted hover:text-navy disabled:opacity-30" onClick={() => move(i, -1)}><ArrowUp size={15} /></button>
                <button aria-label={`Move ${m.name} down`} disabled={i === members.length - 1} className="flex h-5 w-8 items-center justify-center text-muted hover:text-navy disabled:opacity-30" onClick={() => move(i, 1)}><ArrowDown size={15} /></button>
              </div>
              {m.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.photoUrl} alt="" className="h-11 w-11 flex-none rounded-full object-cover" />
              ) : <div className="ph h-11 w-11 flex-none rounded-full" />}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5"><span className="truncate font-bold">{m.name}</span><span className="truncate text-[13px] text-muted">{m.designation || "—"}</span></div>
              <div className="flex items-center gap-2 text-[13px] text-muted">
                {m.visible ? "Visible" : "Hidden"}
                <Switch label={`Show ${m.name} on site`} checked={m.visible} onCheckedChange={async (v) => { await setMemberVisible(m.id, v); toast(v ? "Now visible" : "Hidden from site"); refresh(); }} />
              </div>
              <button aria-label={`Edit ${m.name}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-bg2" onClick={() => open(m)}><Pencil size={17} /></button>
              <button aria-label={`Remove ${m.name}`} className="flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-700" onClick={() => setDel(m)}><Trash2 size={17} /></button>
            </li>
          ))}
        </ul>
      )}
      <Drawer open={!!edit} onOpenChange={(o) => !o && setEdit(null)} title={editing ? "Edit member" : "Add member"}>
        <form onSubmit={submit} noValidate className="flex flex-1 flex-col gap-4">
          <div className="flex items-center gap-4">
            {photo || editing?.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo ? URL.createObjectURL(photo) : editing!.photoUrl!} alt="Portrait preview" className="h-[88px] w-[88px] rounded-full object-cover" />
            ) : <div className="ph h-[88px] w-[88px] rounded-full" />}
            <div className="flex flex-col gap-1.5">
              <button type="button" className="btn btn-ghost !min-h-10" onClick={() => fileRef.current?.click()}>Upload portrait</button>
              <span className="text-xs text-muted">Square photo works best.</span>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" aria-label="Upload portrait" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
            </div>
          </div>
          <label className="flex flex-col gap-2 text-[13px] font-semibold">Full name<input className="input font-normal" aria-invalid={!!errors.name} {...register("name")} />{errors.name && <span role="alert" className="font-medium text-red">{errors.name.message}</span>}</label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold">Designation<input className="input font-normal" placeholder="e.g. President, Secretary" {...register("designation")} /></label>
          <div className="flex flex-col gap-2 text-[13px] font-semibold">Group
            <Controller control={control} name="groupName" render={({ field }) => <Select ariaLabel="Group" value={field.value} onValueChange={field.onChange} options={Object.entries(TEAM_GROUPS).map(([value, label]) => ({ value, label }))} />} />
          </div>
          <label className="flex flex-col gap-2 text-[13px] font-semibold">Phone (optional, not shown publicly)<input className="input font-normal" type="tel" {...register("phone")} /></label>
          <div className="flex items-center justify-between text-sm font-semibold">Show on public Team page<Controller control={control} name="visible" render={({ field }) => <Switch label="Visible" checked={!!field.value} onCheckedChange={field.onChange} />} /></div>
          <div className="mt-auto flex justify-end gap-2.5 border-t border-line pt-4">
            <button type="button" className="btn btn-ghost" onClick={() => setEdit(null)}>Cancel</button>
            <button type="submit" className="btn btn-navy" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save member"}</button>
          </div>
        </form>
      </Drawer>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={`Remove ${del?.name ?? ""}?`} description="They will be removed from the public Our Team page and their portrait deleted." confirmLabel="Remove member"
        onConfirm={async () => { await deleteMember(del!.id); toast("Member removed"); refresh(); }} />
    </div>
  );
}
