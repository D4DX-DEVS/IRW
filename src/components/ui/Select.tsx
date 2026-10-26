"use client";
import * as RS from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

export type Option = { value: string; label: string; hint?: string };

export function Select({
  value,
  onValueChange,
  defaultValue,
  name,
  options,
  placeholder = "Select…",
  className = "",
  ariaLabel,
  prefix,
  disabled,
}: {
  value?: string;
  defaultValue?: string;
  onValueChange?: (v: string) => void;
  name?: string;
  options: Option[];
  placeholder?: string;
  className?: string;
  ariaLabel?: string;
  prefix?: string;
  disabled?: boolean;
}) {
  return (
    <RS.Root value={value} defaultValue={defaultValue} onValueChange={onValueChange} name={name} disabled={disabled}>
      <RS.Trigger
        aria-label={ariaLabel}
        className={`input flex items-center justify-between gap-2 text-left font-semibold data-[placeholder]:font-normal data-[placeholder]:text-muted ${className}`}
      >
        <span className="truncate">
          {prefix && <span className="font-normal text-muted">{prefix} </span>}
          <RS.Value placeholder={placeholder} />
        </span>
        <RS.Icon>
          <ChevronDown size={16} />
        </RS.Icon>
      </RS.Trigger>
      <RS.Portal>
        <RS.Content
          position="popper"
          sideOffset={6}
          className="anim-pop z-[100] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-pop"
        >
          <RS.Viewport>
            {options.map((o) => (
              <RS.Item
                key={o.value}
                value={o.value}
                className="flex min-h-10 cursor-pointer select-none items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy outline-none data-[highlighted]:bg-bg2"
              >
                <span className="w-4 text-red">
                  <RS.ItemIndicator>
                    <Check size={14} />
                  </RS.ItemIndicator>
                </span>
                <span className="flex flex-col">
                  <RS.ItemText>{o.label}</RS.ItemText>
                  {o.hint && <span className="text-xs text-muted">{o.hint}</span>}
                </span>
              </RS.Item>
            ))}
          </RS.Viewport>
        </RS.Content>
      </RS.Portal>
    </RS.Root>
  );
}
