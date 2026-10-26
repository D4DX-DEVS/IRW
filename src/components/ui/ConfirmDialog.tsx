"use client";
import * as AD from "@radix-ui/react-alert-dialog";
import { AlertTriangle, Send } from "lucide-react";
import { useState, type ReactNode } from "react";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  requireText,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  requireText?: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const blocked = !!requireText && typed.trim().toUpperCase() !== requireText.toUpperCase();
  return (
    <AD.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) setTyped("");
        onOpenChange(o);
      }}
    >
      <AD.Portal>
        <AD.Overlay className="anim-fade fixed inset-0 z-[90] bg-navy/55 backdrop-blur-[3px]" />
        <AD.Content className="anim-pop fixed left-1/2 top-1/2 z-[91] w-[min(460px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-7 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.45)]">
          <div
            className={`mb-4 flex items-center justify-center rounded-2xl ${tone === "danger" ? "bg-red-100 text-red-700" : "bg-tint text-royal"}`}
            style={{ width: 52, height: 52 }}
          >
            {tone === "danger" ? <AlertTriangle size={24} /> : <Send size={24} />}
          </div>
          <AD.Title className="text-xl font-extrabold">{title}</AD.Title>
          <AD.Description className="mt-2 text-[15px] leading-relaxed text-muted">{description}</AD.Description>
          {requireText && (
            <label className="mt-4 flex flex-col gap-1.5 text-[13px] font-semibold">
              Type {requireText} to confirm
              <input className="input" value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={requireText} autoComplete="off" />
            </label>
          )}
          <div className="mt-6 flex justify-end gap-2.5">
            <AD.Cancel className="btn btn-ghost">Cancel</AD.Cancel>
            <button
              className={`btn ${tone === "danger" ? "btn-danger" : "btn-red"}`}
              disabled={blocked || busy}
              onClick={async () => {
                setBusy(true);
                try {
                  await onConfirm();
                } finally {
                  setBusy(false);
                  setTyped("");
                  onOpenChange(false);
                }
              }}
            >
              {busy ? "Working…" : confirmLabel}
            </button>
          </div>
        </AD.Content>
      </AD.Portal>
    </AD.Root>
  );
}
