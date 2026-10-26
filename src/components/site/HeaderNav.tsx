"use client";
import * as DM from "@radix-ui/react-dropdown-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export interface NavPub {
  id: string;
  title: string;
  fileUrl: string;
}

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/about-us", label: "About Us" },
  { href: "/our-team", label: "Our Team" },
  { href: "/articles", label: "Achievements" },
];

function useActive() {
  const p = usePathname();
  return (href: string) => (href === "/" ? p === "/" : p === href || p.startsWith(`${href}/`));
}

const linkCls = (on: boolean) =>
  `inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-lg px-3.5 text-[15px] font-semibold transition-colors duration-200 hover:text-red ${on ? "text-red" : "text-navy"}`;

function Dropdown({ label, on, items }: { label: string; on: boolean; items: { label: string; href: string; external?: boolean; hint?: string }[] }) {
  return (
    <DM.Root>
      <DM.Trigger className={`${linkCls(on)} group data-[state=open]:text-red`}>
        <span className="link-draw">{label}</span>
        <ChevronDown size={14} className="transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </DM.Trigger>
      <DM.Portal>
        <DM.Content sideOffset={6} align="start" className="anim-pop z-[100] min-w-64 rounded-xl bg-white p-1.5 shadow-pop">
          {items.length === 0 && <div className="px-3 py-2 text-sm text-muted">Nothing here yet</div>}
          {items.map((i) => (
            <DM.Item key={i.href + i.label} asChild>
              <a
                href={i.href}
                {...(i.external ? { target: "_blank", rel: "noopener" } : {})}
                className="flex min-h-10 cursor-pointer items-center justify-between gap-4 rounded-lg px-3 text-sm outline-none transition-[background-color,color,padding] duration-200 data-[highlighted]:bg-bg2 data-[highlighted]:pl-4 data-[highlighted]:text-red"
              >
                {i.label}
                {i.hint && <span className="text-muted">{i.hint}</span>}
              </a>
            </DM.Item>
          ))}
        </DM.Content>
      </DM.Portal>
    </DM.Root>
  );
}

export function HeaderNav({ pubs }: { pubs: NavPub[] }) {
  const isActive = useActive();
  const [open, setOpen] = useState(false);
  const galleryItems = [
    { label: "Images", href: "/images", hint: "Albums" },
    { label: "Video", href: "/video", hint: "Clips" },
  ];
  const pubItems = pubs.map((p) => ({ label: p.title, href: p.fileUrl, external: true, hint: "PDF" }));

  return (
    <>
      <nav aria-label="Main" className="hidden items-center gap-0.5 xl:flex">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className={linkCls(isActive(l.href))}>
            <span className="link-draw">{l.label}</span>
          </Link>
        ))}
        <Dropdown label="Gallery" on={isActive("/images") || isActive("/video")} items={galleryItems} />
        <Link href="/news-events" aria-current={isActive("/news-events") ? "page" : undefined} className={linkCls(isActive("/news-events"))}>
          <span className="link-draw">News &amp; Events</span>
        </Link>
        <Dropdown label="Publications" on={isActive("/publications")} items={[{ label: "All publications", href: "/publications" }, ...pubItems]} />
        <Link href="/contact-us" aria-current={isActive("/contact-us") ? "page" : undefined} className={linkCls(isActive("/contact-us"))}>
          <span className="link-draw">Contact</span>
        </Link>
        <Link href="/contact-us" className="btn btn-red ml-2.5">
          Support Us
        </Link>
      </nav>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger aria-label="Open menu" className="flex h-11 w-11 items-center justify-center rounded-lg bg-bg2 transition-[background-color,transform] duration-150 hover:bg-tint active:scale-95 xl:hidden">
          <Menu size={20} />
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="anim-fade fixed inset-0 z-[80] bg-navy/50" />
          <Dialog.Content className="anim-drawer fixed right-0 top-0 z-[81] flex h-full w-[min(360px,100%)] flex-col gap-1 overflow-y-auto bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="text-lg font-extrabold">Menu</Dialog.Title>
              <Dialog.Close aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-bg2">
                <X size={18} />
              </Dialog.Close>
            </div>
            <Dialog.Description className="sr-only">Site navigation</Dialog.Description>
            {[...LINKS, { href: "/images", label: "Gallery · Images" }, { href: "/video", label: "Gallery · Video" }, { href: "/news-events", label: "News & Events" }, { href: "/publications", label: "Publications" }, { href: "/contact-us", label: "Contact" }].map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{ animationDelay: `${60 + i * 40}ms` }}
                className={`anim-rise flex min-h-12 items-center rounded-lg px-3 text-base font-semibold transition-[background-color,padding] duration-200 hover:bg-bg2 hover:pl-4 ${isActive(l.href) ? "text-red" : ""}`}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/contact-us" onClick={() => setOpen(false)} className="btn btn-red mt-4">
              Support Us
            </Link>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
