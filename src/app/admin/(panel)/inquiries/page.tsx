import { Suspense } from "react";
import { InquiriesTable } from "@/components/admin/InquiriesTable";
import { DataPagination } from "@/components/shared/DataPagination";
import { ListToolbar } from "@/components/shared/ListToolbar";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/shared/states";
import { db } from "@/lib/db";
import { fmtDate, pageParam, strParam, TOPICS } from "@/lib/utils";

export const metadata = { title: "Inquiries" };
type SP = Record<string, string | string[] | undefined>;

async function Data({ sp }: { sp: SP }) {
  const page = pageParam(sp.page);
  const pageSize = [10, 20, 50, 100].includes(Number(strParam(sp.pageSize))) ? Number(strParam(sp.pageSize)) : 10;
  const search = strParam(sp.search).trim();
  const status = strParam(sp.status);
  const topic = strParam(sp.topic);
  const order = strParam(sp.order) === "asc" ? "asc" : "desc";
  const where = {
    ...(["OPEN", "RESOLVED"].includes(status) ? { status } : {}),
    ...(topic in TOPICS ? { topic } : {}),
    ...(search ? { OR: [{ name: { contains: search } }, { email: { contains: search } }, { message: { contains: search } }] } : {}),
  };
  const [total, items] = await Promise.all([db.inquiry.count({ where }), db.inquiry.findMany({ where, orderBy: { createdAt: order }, skip: (page - 1) * pageSize, take: pageSize })]);
  const rows = items.map((i) => ({ id: i.id, name: i.name, email: i.email, phone: i.phone, topic: i.topic, topicLabel: TOPICS[i.topic as keyof typeof TOPICS] ?? i.topic, district: i.district, message: i.message, status: i.status, unread: !i.readAt, when: fmtDate(i.createdAt, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) }));
  if (rows.length === 0) return <EmptyState title="No inquiries" hint={search || status || topic ? "Nothing matches these filters." : "Messages from the Contact page appear here."} clearHref={search || status || topic ? "?" : undefined} />;
  return (
    <>
      <InquiriesTable rows={rows} />
      <DataPagination page={page} pageSize={pageSize} total={total} />
    </>
  );
}

export default async function AdminInquiriesPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader crumb="Engagement / Inquiries" title="Inquiries" />
      <div className="card overflow-visible rounded-[18px]">
        <Suspense>
          <ListToolbar
            searchPlaceholder="Search name, email or message…"
            filters={[
              { key: "status", label: "Status", options: [{ value: "all", label: "All" }, { value: "OPEN", label: "Open" }, { value: "RESOLVED", label: "Resolved" }] },
              { key: "topic", label: "Type", options: [{ value: "all", label: "All" }, ...Object.entries(TOPICS).map(([value, label]) => ({ value, label }))] },
            ]}
            sorts={[{ value: "createdAt", label: "Received" }]}
            defaultSort="createdAt"
          />
        </Suspense>
        <Suspense key={JSON.stringify(sp)} fallback={<TableSkeleton cols={5} rows={8} />}>
          <Data sp={sp} />
        </Suspense>
      </div>
    </>
  );
}
