import { Suspense } from "react";
import { PublicationsTable } from "@/components/admin/PublicationsTable";
import { DataPagination } from "@/components/shared/DataPagination";
import { ListToolbar } from "@/components/shared/ListToolbar";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/shared/states";
import { db } from "@/lib/db";
import { fmtBytes, pageParam, strParam } from "@/lib/utils";

export const metadata = { title: "Publications" };
type SP = Record<string, string | string[] | undefined>;

async function Data({ sp }: { sp: SP }) {
  const page = pageParam(sp.page);
  const pageSize = [10, 20, 50, 100].includes(Number(strParam(sp.pageSize))) ? Number(strParam(sp.pageSize)) : 10;
  const search = strParam(sp.search).trim();
  const category = strParam(sp.category);
  const order = strParam(sp.order) === "asc" ? "asc" : "desc";
  const sort = ["year", "title", "createdAt"].includes(strParam(sp.sort)) ? strParam(sp.sort) : "year";
  const where = { ...(["ANNUAL", "RESCUE", "OTHER"].includes(category) ? { category } : {}), ...(search ? { title: { contains: search } } : {}) };
  const [total, docs] = await Promise.all([db.publication.count({ where }), db.publication.findMany({ where, orderBy: { [sort]: order }, skip: (page - 1) * pageSize, take: pageSize })]);
  const rows = docs.map((d) => ({ id: d.id, title: d.title, category: d.category, year: d.year, fileUrl: d.fileUrl, size: fmtBytes(d.sizeBytes), showInMenu: d.showInMenu }));
  return (
    <>
      <PublicationsTable rows={rows} />
      {rows.length === 0 && <EmptyState title="No publications found" hint="Upload a PDF to publish it." clearHref={search || category ? "?" : undefined} />}
      <DataPagination page={page} pageSize={pageSize} total={total} />
    </>
  );
}

export default async function AdminPublicationsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  return (
    <>
      <PageHeader crumb="Content / Publications" title="Publications" />
      <div className="card overflow-visible rounded-[18px]">
        <Suspense>
          <ListToolbar
            searchPlaceholder="Search publications…"
            filters={[{ key: "category", label: "Category", options: [{ value: "all", label: "All" }, { value: "ANNUAL", label: "Annual report" }, { value: "RESCUE", label: "Rescue report" }, { value: "OTHER", label: "Other" }] }]}
            sorts={[{ value: "year", label: "Year" }, { value: "title", label: "Title" }, { value: "createdAt", label: "Uploaded" }]}
            defaultSort="year"
          />
        </Suspense>
        <Suspense key={JSON.stringify(sp)} fallback={<TableSkeleton cols={4} rows={6} />}>
          <Data sp={sp} />
        </Suspense>
      </div>
    </>
  );
}
