"use client";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Award, Image as ImageIcon, LayoutDashboard, LogOut, Menu, MessageSquare, Newspaper, PanelTop, Settings, FileText, Users, X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { logoutAction } from "@/app/admin/actions/auth";

interface Counts {
  posts: number;
  inquiries: number;
}

const GROUPS: { title: string; items: { href: string; label: string; icon: ReactNode; count?: keyof Counts; exact?: boolean }[] }[] = [
  { title: "Overview", items: [{ href: "/admin", label: "Dashboard", icon: <LayoutDashboard size={18} />, exact: true }] },
  {
    title: "Content",
    items: [
      { href: "/admin/banners", label: "Home banners", icon: <PanelTop size={18} /> },
      { href: "/admin/news", label: "News & Events", icon: <Newspaper size={18} />, count: "posts" },
      { href: "/admin/achievements", label: "Achievements", icon: <Award size={18} /> },
      { href: "/admin/media", label: "Gallery & Videos", icon: <ImageIcon size={18} /> },
      { href: "/admin/team", label: "Team", icon: <Users size={18} /> },
      { href: "/admin/publications", label: "Publications", icon: <FileText size={18} /> },
    ],
  },
  { title: "Engagement", items: [{ href: "/admin/inquiries", label: "Inquiries", icon: <MessageSquare size={18} />, count: "inquiries" }] },
  { title: "System", items: [{ href: "/admin/settings", label: "Site settings", icon: <Settings size={18} /> }] },
];

function Nav({ counts, onNavigate }: { counts: Counts; onNavigate?: () => void }) {
  const path = usePathname();
  const on = (href: string, exact?: boolean) => (exact ? path === href : path === href || path.startsWith(`${href}/`));
  return (
    <nav aria-label="Admin" className="flex flex-col gap-0.5">
      {GROUPS.map((g) => (
        <div key={g.title} className="flex flex-col gap-0.5">
          <span className="px-3 pb-1.5 pt-3.5 text-[11px] font-bold uppercase tracking-[.12em] text-[#8190a8]">{g.title}</span>
          {g.items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              onClick={onNavigate}
              aria-current={on(i.href, i.exact) ? "page" : undefined}
              className={`flex min-h-11 items-center gap-3 rounded-[10px] px-3 text-[14.5px] ${on(i.href, i.exact) ? "bg-red font-semibold text-white" : "text-[#c3cde0] hover:bg-white/10 hover:text-white"}`}
            >
              {i.icon}
              {i.label}
              {i.count && counts[i.count] > 0 && (
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs ${i.count === "inquiries" && !on(i.href) ? "bg-[#ff4d5e] text-white" : "bg-white/15"}`}>{counts[i.count]}</span>
              )}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  );
}

interface Logo {
  url: string;
  name: string;
}

function Brand({ logo }: { logo: Logo }) {
  if (logo.url) {
    return (
      <div className="flex min-w-0 flex-col gap-1.5 px-2 py-1">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.url} alt={logo.name} width={592} height={148} className="h-10 w-auto max-w-full self-start object-contain" />
        <span className="text-xs text-[#8d99ad]">Admin · Content console</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2.5 px-2 py-1">
      <span className="flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-[#ff4d5e] text-[11px] font-black text-white">IRW</span>
      <span className="flex flex-col leading-tight text-white">
        <span className="text-[15px] font-extrabold">IRW Admin</span>
        <span className="text-xs text-[#8d99ad]">Content console</span>
      </span>
    </div>
  );
}

function UserBox({ name, role }: { name: string; role: string }) {
  return (
    <div className="mt-auto flex items-center gap-2.5 border-t border-white/10 px-2 pt-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-royal text-[13px] font-bold text-white">{name.slice(0, 2).toUpperCase()}</span>
      <span className="flex min-w-0 flex-col leading-tight text-white">
        <span className="truncate text-sm font-semibold">{name}</span>
        <span className="text-xs text-[#8d99ad]">{role === "SUPER_ADMIN" ? "Super admin" : "Editor"}</span>
      </span>
      <form action={logoutAction} className="ml-auto">
        <button aria-label="Sign out" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#c3cde0] hover:bg-white/10"><LogOut size={18} /></button>
      </form>
    </div>
  );
}

export function Sidebar({ counts, user, logo }: { counts: Counts; user: { name: string; role: string }; logo: Logo }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-[264px] flex-none flex-col gap-5 overflow-y-auto bg-navy px-3.5 py-5 lg:flex">
        <Brand logo={logo} />
        <Nav counts={counts} />
        <UserBox {...user} />
      </aside>
      <div className="sticky top-0 z-30 flex items-center justify-between bg-navy px-4 py-3 lg:hidden">
        <Brand logo={logo} />
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger aria-label="Open menu" className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/25 text-white"><Menu size={20} /></Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="anim-fade fixed inset-0 z-[80] bg-navy/60" />
            <Dialog.Content className="anim-drawer fixed left-0 top-0 z-[81] flex h-full w-[min(300px,100%)] flex-col gap-5 overflow-y-auto bg-navy px-3.5 py-5">
              <div className="flex items-center justify-between">
                <Brand logo={logo} />
                <Dialog.Close aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10"><X size={18} /></Dialog.Close>
              </div>
              <Dialog.Title className="sr-only">Admin menu</Dialog.Title>
              <Dialog.Description className="sr-only">Admin navigation</Dialog.Description>
              <Nav counts={counts} onNavigate={() => setOpen(false)} />
              <UserBox {...user} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </>
  );
}
