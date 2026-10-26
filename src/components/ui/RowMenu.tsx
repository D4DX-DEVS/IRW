"use client";
import * as DM from "@radix-ui/react-dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type MenuItem =
  | { label: string; icon?: ReactNode; href: string }
  | { label: string; icon?: ReactNode; onSelect: () => void; danger?: boolean }
  | "sep";

export function RowMenu({ items, label }: { items: MenuItem[]; label: string }) {
  return (
    <DM.Root>
      <DM.Trigger
        aria-label={label}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-bg2 hover:text-navy data-[state=open]:bg-bg2"
      >
        <MoreHorizontal size={18} />
      </DM.Trigger>
      <DM.Portal>
        <DM.Content align="end" sideOffset={6} className="anim-pop z-[100] min-w-48 rounded-xl border border-line bg-white p-1.5 shadow-pop">
          {items.map((it, i) =>
            it === "sep" ? (
              <DM.Separator key={i} className="my-1 h-px bg-line" />
            ) : "href" in it ? (
              <DM.Item key={i} asChild>
                <Link href={it.href} className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-bg2">
                  {it.icon}
                  {it.label}
                </Link>
              </DM.Item>
            ) : (
              <DM.Item
                key={i}
                onSelect={it.onSelect}
                className={`flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg px-3 text-sm outline-none ${
                  it.danger ? "text-red-700 data-[highlighted]:bg-red-50" : "data-[highlighted]:bg-bg2"
                }`}
              >
                {it.icon}
                {it.label}
              </DM.Item>
            ),
          )}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}
