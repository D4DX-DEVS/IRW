import { CheckCircle2, Clock, FileEdit, Trash2 } from "lucide-react";

const MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  PUBLISHED: { label: "Published", cls: "bg-green-100 text-green-800", icon: <CheckCircle2 size={12} /> },
  SCHEDULED: { label: "Scheduled", cls: "bg-tint text-royal", icon: <Clock size={12} /> },
  DRAFT: { label: "Draft", cls: "bg-bg2 text-muted", icon: <FileEdit size={12} /> },
  TRASH: { label: "In trash", cls: "bg-red-100 text-red-800", icon: <Trash2 size={12} /> },
  OPEN: { label: "Open", cls: "bg-amber-100 text-amber-800", icon: <Clock size={12} /> },
  RESOLVED: { label: "Resolved", cls: "bg-green-100 text-green-800", icon: <CheckCircle2 size={12} /> },
};

export function StatusBadge({ status }: { status: string }) {
  const m = MAP[status] ?? MAP.DRAFT;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${m.cls}`}>{m.icon}{m.label}</span>;
}
