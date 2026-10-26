import { AlertCircle, Inbox } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function EmptyState({
  title,
  hint,
  action,
  clearHref,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  clearHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-tint text-royal">
        <Inbox size={26} />
      </span>
      <h3 className="text-lg font-extrabold">{title}</h3>
      {hint && <p className="max-w-sm text-sm text-muted">{hint}</p>}
      <div className="mt-1 flex gap-2">
        {clearHref && (
          <Link href={clearHref} className="btn btn-ghost">
            Clear filters
          </Link>
        )}
        {action}
      </div>
    </div>
  );
}

export function ErrorState({ message = "Something went wrong while loading this data." }: { message?: string }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
        <AlertCircle size={26} />
      </span>
      <h3 className="text-lg font-extrabold">Could not load</h3>
      <p className="max-w-sm text-sm text-muted">{message}</p>
      <Link href="" className="btn btn-ghost" prefetch={false}>
        Retry
      </Link>
    </div>
  );
}

export function TableSkeleton({ cols = 5, rows = 8 }: { cols?: number; rows?: number }) {
  return (
    <div className="overflow-hidden" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid items-center gap-4 border-t border-line px-4 py-4" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: cols }).map((__, c) => (
            <div key={c} className="h-4 animate-pulse rounded bg-bg2" style={{ width: `${55 + ((r * 7 + c * 13) % 40)}%` }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PageHeader({
  crumb,
  title,
  actions,
}: {
  crumb: string;
  title: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
          {crumb}
        </nav>
        <h1 className="text-[30px] font-extrabold tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
}
