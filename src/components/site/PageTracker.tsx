"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageTracker() {
  const path = usePathname();
  useEffect(() => {
    let sid = "";
    try {
      sid = sessionStorage.getItem("irw_sid") ?? "";
      if (!sid) {
        sid = crypto.randomUUID();
        sessionStorage.setItem("irw_sid", sid);
      }
    } catch {
      sid = "anon";
    }
    const body = JSON.stringify({ path, sid });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body, keepalive: true });
  }, [path]);
  return null;
}
