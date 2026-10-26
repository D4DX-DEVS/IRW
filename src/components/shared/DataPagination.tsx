"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/Select";

const SIZES = ["10", "20", "50", "100"].map((v) => ({ value: v, label: `${v} / page` }));

export function DataPagination({ page, pageSize, total }: { page: number; pageSize: number; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const go = (next: Record<string, string>) => {
    const q = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(next)) q.set(k, v);
    router.push(`${pathname}?${q.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3.5">
      <span className="text-[13px] text-muted">
        {total === 0 ? "0 results" : `${(page - 1) * pageSize + 1}–${Math.min(total, page * pageSize)} of ${total} results`}
      </span>
      <nav aria-label="Pagination" className="flex flex-wrap items-center gap-2">
        <div className="w-32">
          <Select
            ariaLabel="Rows per page"
            value={String(pageSize)}
            onValueChange={(v) => go({ pageSize: v, page: "1" })}
            options={SIZES}
            className="!min-h-9 !py-1.5 text-[13px]"
          />
        </div>
        <button
          className="btn btn-ghost !min-h-9 !px-3"
          disabled={page <= 1}
          onClick={() => go({ page: String(page - 1) })}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-24 text-center text-[13px] font-semibold">
          Page {Math.min(page, totalPages)} of {totalPages}
        </span>
        <button
          className="btn btn-ghost !min-h-9 !px-3"
          disabled={page >= totalPages}
          onClick={() => go({ page: String(page + 1) })}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
}
