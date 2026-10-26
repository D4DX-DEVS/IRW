"use client";
import { CheckCircle2, Mail, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toaster";
import { StatusBadge } from "./StatusBadge";
import { deleteInquiry, markInquiryRead, setInquiryStatus } from "@/app/admin/actions/inquiries";

export interface InquiryRow {
  id: string; name: string; email: string; phone: string; topic: string; topicLabel: string;
  district: string; message: string; status: string; unread: boolean; when: string;
}

const TOPIC_CLS: Record<string, string> = {
  VOLUNTEER: "bg-green-100 text-green-800", DONATION: "bg-amber-100 text-amber-800", EMERGENCY: "bg-red-100 text-red-800", GENERAL: "bg-tint text-royal",
};

export function InquiriesTable({ rows }: { rows: InquiryRow[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [, start] = useTransition();
  const [cur, setCur] = useState<InquiryRow | null>(null);
  const [del, setDel] = useState<InquiryRow | null>(null);
  const refresh = () => start(() => router.refresh());

  const open = async (r: InquiryRow) => {
    setCur(r);
    if (r.unread) {
      await markInquiryRead(r.id);
      refresh();
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead><tr className="bg-[#f7fafd] text-left text-xs uppercase tracking-wider text-muted"><th className="px-4 py-3 font-semibold">From</th><th className="px-2 py-3 font-semibold">Type</th><th className="hidden px-2 py-3 font-semibold md:table-cell">Message</th><th className="px-2 py-3 font-semibold">Status</th><th className="hidden px-4 py-3 font-semibold sm:table-cell">Received</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="cursor-pointer border-t border-line hover:bg-[#fafcfe]" onClick={() => open(r)}>
                <td className="px-4 py-3.5">
                  <button className="flex flex-col text-left" onClick={(e) => { e.stopPropagation(); open(r); }}>
                    <span className={r.unread ? "font-extrabold" : "font-medium"}>{r.unread && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-red align-middle" aria-label="Unread" />}{r.name}</span>
                    <span className="text-xs text-muted">{r.email}</span>
                  </button>
                </td>
                <td className="px-2 py-3.5"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${TOPIC_CLS[r.topic]}`}>{r.topicLabel}</span></td>
                <td className="hidden max-w-[320px] truncate px-2 py-3.5 text-muted md:table-cell">{r.message}</td>
                <td className="px-2 py-3.5"><StatusBadge status={r.status} /></td>
                <td className="hidden px-4 py-3.5 text-muted sm:table-cell">{r.when}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Drawer open={!!cur} onOpenChange={(o) => !o && setCur(null)} title="Inquiry">
        {cur && (
          <div className="flex flex-1 flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tint font-extrabold text-royal">{cur.name.slice(0, 2).toUpperCase()}</span>
              <div className="flex flex-col"><span className="text-lg font-extrabold">{cur.name}</span><span className="text-[13px] text-muted">{cur.when}</span></div>
            </div>
            <dl className="grid grid-cols-2 gap-2.5 text-[13px]">
              <div className="rounded-[10px] bg-[#f7fafd] p-3"><dt className="text-muted">Type</dt><dd className="font-bold">{cur.topicLabel}</dd></div>
              <div className="rounded-[10px] bg-[#f7fafd] p-3"><dt className="text-muted">District</dt><dd className="font-bold">{cur.district || "—"}</dd></div>
              <div className="rounded-[10px] bg-[#f7fafd] p-3"><dt className="text-muted">Email</dt><dd className="break-all font-bold"><a href={`mailto:${cur.email}`} className="text-red">{cur.email}</a></dd></div>
              <div className="rounded-[10px] bg-[#f7fafd] p-3"><dt className="text-muted">Phone</dt><dd className="font-bold">{cur.phone ? <a href={`tel:${cur.phone}`} className="text-red">{cur.phone}</a> : "—"}</dd></div>
            </dl>
            <p className="whitespace-pre-line text-base leading-7 text-body">{cur.message}</p>
            <div className="mt-auto flex flex-wrap justify-between gap-2.5 border-t border-line pt-4">
              <button className="btn btn-ghost text-red-700" onClick={() => setDel(cur)}><Trash2 size={15} /> Delete</button>
              <div className="flex gap-2.5">
                <a className="btn btn-ghost" href={`mailto:${cur.email}?subject=${encodeURIComponent("Re: your enquiry to IRW Kerala")}`}><Mail size={15} /> Reply by email</a>
                {cur.status === "OPEN" ? (
                  <button className="btn btn-navy" onClick={async () => { await setInquiryStatus(cur.id, "RESOLVED"); toast("Marked as resolved"); setCur(null); refresh(); }}><CheckCircle2 size={15} /> Mark resolved</button>
                ) : (
                  <button className="btn btn-navy" onClick={async () => { await setInquiryStatus(cur.id, "OPEN"); toast("Reopened"); setCur(null); refresh(); }}><RotateCcw size={15} /> Reopen</button>
                )}
              </div>
            </div>
          </div>
        )}
      </Drawer>
      <ConfirmDialog open={!!del} onOpenChange={(o) => !o && setDel(null)} title={`Delete inquiry from ${del?.name ?? ""}?`} description="The message is permanently deleted. This cannot be undone." confirmLabel="Delete inquiry"
        onConfirm={async () => { await deleteInquiry(del!.id); toast("Inquiry deleted"); setCur(null); refresh(); }} />
    </>
  );
}
