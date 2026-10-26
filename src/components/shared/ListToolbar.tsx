"use client";
import { ArrowDownWideNarrow, ArrowUpWideNarrow, Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Select, type Option } from "@/components/ui/Select";

export interface FilterDef {
  key: string;
  label: string;
  options: Option[]; // first option is the "all" value
}

export function ListToolbar({
  searchPlaceholder = "Search…",
  filters = [],
  sorts = [],
  defaultSort,
}: {
  searchPlaceholder?: string;
  filters?: FilterDef[];
  sorts?: Option[];
  defaultSort?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [, startTransition] = useTransition();
  const [text, setText] = useState(sp.get("search") ?? "");
  const first = useRef(true);

  const push = (patch: Record<string, string | null>) => {
    const q = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") q.delete(k);
      else q.set(k, v);
    }
    q.set("page", "1");
    startTransition(() => router.replace(`${pathname}?${q.toString()}`));
  };

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => push({ search: text.trim() }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  const order = sp.get("order") === "asc" ? "asc" : "desc";
  const active = filters.some((f) => (sp.get(f.key) ?? f.options[0].value) !== f.options[0].value) || !!sp.get("search");

  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line p-4">
      <label className="flex min-h-11 min-w-[220px] flex-[999_1_260px] items-center gap-2 rounded-[10px] border border-line2 bg-white px-3 focus-within:border-navy">
        <Search size={16} className="text-muted" />
        <span className="sr-only">Search</span>
        <input
          type="search"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={searchPlaceholder}
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </label>
      {filters.map((f) => (
        <div key={f.key} className="min-w-[170px] flex-1 sm:flex-none">
          <Select
            ariaLabel={f.label}
            prefix={`${f.label}:`}
            value={sp.get(f.key) ?? f.options[0].value}
            onValueChange={(v) => push({ [f.key]: v === f.options[0].value ? null : v })}
            options={f.options}
          />
        </div>
      ))}
      {sorts.length > 0 && (
        <div className="flex gap-1.5">
          <div className="min-w-[170px]">
            <Select
              ariaLabel="Sort by"
              prefix="Sort:"
              value={sp.get("sort") ?? defaultSort ?? sorts[0].value}
              onValueChange={(v) => push({ sort: v })}
              options={sorts}
            />
          </div>
          <button
            className="btn btn-ghost !px-3"
            aria-label={order === "asc" ? "Ascending, switch to descending" : "Descending, switch to ascending"}
            onClick={() => push({ order: order === "asc" ? "desc" : "asc" })}
          >
            {order === "asc" ? <ArrowUpWideNarrow size={16} /> : <ArrowDownWideNarrow size={16} />}
          </button>
        </div>
      )}
      {active && (
        <button
          className="btn btn-ghost"
          onClick={() => {
            setText("");
            const q = new URLSearchParams();
            const ps = sp.get("pageSize");
            if (ps) q.set("pageSize", ps);
            startTransition(() => router.replace(`${pathname}?${q.toString()}`));
          }}
        >
          <X size={15} /> Clear filters
        </button>
      )}
    </div>
  );
}
