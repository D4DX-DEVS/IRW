import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/Toaster";

export const metadata: Metadata = { title: { default: "IRW Admin", template: "%s · IRW Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
