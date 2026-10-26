import { Sidebar } from "@/components/admin/Sidebar";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireSession();
  const [posts, inquiries, settings] = await Promise.all([
    db.post.count({ where: { deletedAt: null } }),
    db.inquiry.count({ where: { status: "OPEN" } }),
    getSettings(),
  ]);
  return (
    <div className="flex min-h-screen flex-col bg-bg2 lg:flex-row">
      <Sidebar counts={{ posts, inquiries }} user={{ name: me.name, role: me.role }} logo={{ url: settings.logoWhiteUrl, name: settings.orgName }} />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-9 lg:py-7">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
