"use client";
import * as T from "@radix-ui/react-tabs";

export function Tabs({
  value,
  onValueChange,
  items,
}: {
  value: string;
  onValueChange: (v: string) => void;
  items: { value: string; label: string }[];
}) {
  return (
    <T.Root value={value} onValueChange={onValueChange}>
      <T.List className="inline-flex flex-wrap gap-1 rounded-xl bg-bg2 p-1">
        {items.map((i) => (
          <T.Trigger
            key={i.value}
            value={i.value}
            className="rounded-lg px-3.5 py-2 text-[13px] font-semibold text-muted data-[state=active]:bg-white data-[state=active]:text-navy data-[state=active]:shadow-sm"
          >
            {i.label}
          </T.Trigger>
        ))}
      </T.List>
    </T.Root>
  );
}
