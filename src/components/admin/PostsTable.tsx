"use client";
import * as Checkbox from "@radix-ui/react-checkbox";
import { Check, Copy, ExternalLink, Pencil, RotateCcw, Send, Trash2, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { RowMenu } from "@/components/ui/RowMenu";
import { useToast } from "@/components/ui/Toaster";
import { duplicatePost, restorePosts, setPostsStatus, trashPosts } from "@/app/admin/actions/posts";
import { StatusBadge } from "./StatusBadge";

export interface PostRow {
  id: string;
  title: string;
  slug: string;
  type: string;
  typeLabel: string;
  status: string;
  date: string;
  author: string;
  views: number;
  coverUrl: string | null;
  trashed: boolean;
}

export function PostsTable({ rows, editBase }: { rows: PostRow[]; editBase: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, start] = useTransition();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [ask, setAsk] = useState<{ ids: string[]; what: string } | null>(null);

  const allOn = rows.length > 0 && rows.every((r) => sel.has(r.id));
  const toggle = (id: string) => setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const refresh = () => start(() => router.refresh());

  const doTrash = async (ids: string[]) => {
    const res = await trashPosts(ids);
    if (!res.ok) return toast(res.error, { tone: "error" });
    setSel(new Set());
    toast(ids.length > 1 ? `${ids.length} posts moved to Trash` : "Post moved to Trash", {
      undo: async () => { await restorePosts(ids); refresh(); },
    });
    refresh();
  };
  const doStatus = async (ids: string[], status: "PUBLISHED" | "DRAFT") => {
    const res = await setPostsStatus(ids, status);
    if (!res.ok) return toast(res.error, { tone: "error" });
    setSel(new Set());
    toast(status === "PUBLISHED" ? "Published" : "Moved to draft");
    refresh();
  };

  const selected = [...sel];
  return (
    <>
      {selected.length > 0 && (
        <div className="anim-fade flex flex-wrap items-center gap-3 bg-navy px-4 py-2.5 text-white">
          <span className="text-sm font-semibold">{selected.length} selected</span>
          <button className="btn !min-h-9 border-white/30 text-white hover:bg-white/10" onClick={() => doStatus(selected, "PUBLISHED")}>Publish</button>
          <button className="btn !min-h-9 border-white/30 text-white hover:bg-white/10" onClick={() => doStatus(selected, "DRAFT")}>Move to draft</button>
          <button className="btn btn-red !min-h-9" onClick={() => setAsk({ ids: selected, what: `${selected.length} posts` })}>Delete</button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="bg-[#f7fafd] text-left text-xs uppercase tracking-wider text-muted">
              <th className="w-10 px-4 py-3">
                <Checkbox.Root aria-label="Select all" checked={allOn} onCheckedChange={(c) => setSel(c === true ? new Set(rows.map((r) => r.id)) : new Set())} className="flex h-4 w-4 items-center justify-center rounded border border-line2 bg-white data-[state=checked]:border-navy data-[state=checked]:bg-navy">
                  <Checkbox.Indicator className="text-white"><Check size={12} /></Checkbox.Indicator>
                </Checkbox.Root>
              </th>
              <th className="px-2 py-3 font-semibold">Post</th>
              <th className="hidden px-2 py-3 font-semibold md:table-cell">Type</th>
              <th className="px-2 py-3 font-semibold">Status</th>
              <th className="hidden px-2 py-3 font-semibold lg:table-cell">Date</th>
              <th className="hidden px-2 py-3 font-semibold lg:table-cell">Author</th>
              <th className="hidden px-2 py-3 font-semibold xl:table-cell">Views</th>
              <th className="w-12 px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line hover:bg-[#fafcfe]">
                <td className="px-4 py-3">
                  <Checkbox.Root aria-label={`Select ${r.title}`} checked={sel.has(r.id)} onCheckedChange={() => toggle(r.id)} className="flex h-4 w-4 items-center justify-center rounded border border-line2 bg-white data-[state=checked]:border-navy data-[state=checked]:bg-navy">
                    <Checkbox.Indicator className="text-white"><Check size={12} /></Checkbox.Indicator>
                  </Checkbox.Root>
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    {r.coverUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.coverUrl} alt="" className="h-10 w-14 flex-none rounded-lg object-cover" />
                    ) : (
                      <div className="ph h-10 w-14 flex-none rounded-lg" />
                    )}
                    <div className="flex min-w-0 flex-col gap-0.5">
                      <Link href={`${editBase}/${r.id}`} className="ml max-w-[360px] truncate font-semibold hover:text-red">{r.title}</Link>
                      <span className="truncate text-xs text-muted">/news-events/{r.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="hidden px-2 py-3 text-muted md:table-cell">{r.typeLabel}</td>
                <td className="px-2 py-3"><StatusBadge status={r.trashed ? "TRASH" : r.status} /></td>
                <td className="hidden px-2 py-3 text-muted lg:table-cell">{r.date}</td>
                <td className="hidden px-2 py-3 lg:table-cell">{r.author}</td>
                <td className="hidden px-2 py-3 tabular-nums xl:table-cell">{r.views}</td>
                <td className="px-4 py-3 text-right">
                  <RowMenu
                    label={`Actions for ${r.title}`}
                    items={
                      r.trashed
                        ? [{ label: "Restore", icon: <RotateCcw size={15} />, onSelect: async () => { await restorePosts([r.id]); toast("Post restored"); refresh(); } }]
                        : [
                            { label: "Edit", icon: <Pencil size={15} />, href: `${editBase}/${r.id}` },
                            { label: "Duplicate", icon: <Copy size={15} />, onSelect: async () => { const x = await duplicatePost(r.id); toast(x.ok ? "Duplicated as draft" : x.error, { tone: x.ok ? "ok" : "error" }); refresh(); } },
                            ...(r.status === "PUBLISHED"
                              ? [
                                  { label: "View on site", icon: <ExternalLink size={15} />, href: `/news-events/${r.slug}` },
                                  { label: "Unpublish", icon: <EyeOff size={15} />, onSelect: () => doStatus([r.id], "DRAFT") },
                                ]
                              : [{ label: "Publish now", icon: <Send size={15} />, onSelect: () => doStatus([r.id], "PUBLISHED") }]),
                            "sep" as const,
                            { label: "Delete…", icon: <Trash2 size={15} />, danger: true, onSelect: () => setAsk({ ids: [r.id], what: `“${r.title}”` }) },
                          ]
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!ask}
        onOpenChange={(o) => !o && setAsk(null)}
        title={`Delete ${ask?.what ?? ""}?`}
        description="This removes it from the public site and moves it to Trash. You can restore it from the Trash view."
        confirmLabel="Delete"
        requireText={ask && ask.ids.length > 1 ? "DELETE" : undefined}
        onConfirm={() => doTrash(ask!.ids)}
      />
    </>
  );
}
