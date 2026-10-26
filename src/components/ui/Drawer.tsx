"use client";
import * as D from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Drawer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  children: ReactNode;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <D.Overlay className="anim-fade fixed inset-0 z-[80] bg-navy/45" />
        <D.Content className="anim-drawer fixed right-0 top-0 z-[81] flex h-full w-[min(480px,100%)] flex-col gap-5 overflow-y-auto bg-white p-7 shadow-[-20px_0_60px_-20px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between">
            <D.Title className="text-[22px] font-extrabold">{title}</D.Title>
            <D.Close aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-bg2">
              <X size={18} />
            </D.Close>
          </div>
          <D.Description className="sr-only">{title}</D.Description>
          {children}
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
