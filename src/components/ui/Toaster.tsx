"use client";
import * as T from "@radix-ui/react-toast";
import { Check } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Opts = { undo?: () => void; tone?: "ok" | "error" };
type Item = { id: number; msg: string } & Opts;

const Ctx = createContext<{ toast: (msg: string, o?: Opts) => void }>({ toast: () => {} });
export const useToast = () => useContext(Ctx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const toast = useCallback((msg: string, o?: Opts) => {
    setItems((s) => [...s, { id: Date.now() + Math.random(), msg, ...o }]);
  }, []);
  return (
    <Ctx.Provider value={{ toast }}>
      <T.Provider duration={4500} swipeDirection="right">
        {children}
        {items.map((i) => (
          <T.Root
            key={i.id}
            onOpenChange={(o) => {
              if (!o) setItems((s) => s.filter((x) => x.id !== i.id));
            }}
            className="anim-pop flex items-center gap-3.5 rounded-xl bg-navy px-4 py-3.5 text-sm text-white shadow-[0_20px_40px_-16px_rgba(0,0,0,0.5)]"
          >
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ${i.tone === "error" ? "bg-red" : "bg-green-600"}`}>
              <Check size={13} />
            </span>
            <T.Description>{i.msg}</T.Description>
            {i.undo && (
              <T.Action altText="Undo" asChild>
                <button onClick={i.undo} className="font-bold text-[#ff9aa6]">
                  Undo
                </button>
              </T.Action>
            )}
          </T.Root>
        ))}
        <T.Viewport className="fixed right-6 top-6 z-[200] flex w-[min(380px,calc(100%-32px))] flex-col gap-2 outline-none" />
      </T.Provider>
    </Ctx.Provider>
  );
}
