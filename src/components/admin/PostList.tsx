import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DataPagination } from "@/components/shared/DataPagination";
import { ListToolbar } from "@/components/shared/ListToolbar";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/shared/states";
import { db } from "@/lib/db";
import { fmtDate, pageParam, POST_TYPES, strParam } from "@/lib/utils";
import { PostsTable } from "./PostsTable";

type SP = Record<string, string | string[] | undefined>;
const SORTS = ["publishedAt", "createdAt", "title", "views"] as const;

async function Data({ sp, fixedType, editBase }: { sp: SP; fixedType?: string; editBase: string }) {
  const page = pageParam(sp.page);
  const pageSize = [10, 20, 50, 100].includes(Number(strParam(sp.pageSize))) ? Number(strParam(sp.pageSize)) : 10;
  const search = strParam(sp.search).trim();
  const status = strParam(sp.status);
  const typeP = fixedType ?? strParam(sp.type);
  const sort = (SORTS as readonly string[]).includes(strParam(sp.sort)) ? strParam(sp.sort) : "createdAt";
  const order = strParam(sp.order) === "asc" ? "asc" : "desc";
  const trash = status === "TRASH";

  const where = {
    deletedAt: trash ? { not: null } : null,
    ...(!trash && ["PUBLISHED", "DRAFT", "SCHEDULED"].includes(status) ? { status } : {}),
    ...(typeP in POST_TYPES ? { type: typeP } : {}),
    ...(search ? { OR: [{ title: { contains: search } }, { tags: { contains: search } }, { slug: { contains: search } }] } : {}),
  };
  const [total, posts] = await Promise.all([
    db.post.count({ where }),
    db.post.findMany({ where, orderBy: { [sort]: order }, skip: (page - 1) * pageSize, take: pageSize }),
  ]);

  const rows = posts.map((p) => ({
    id: p.id, title: p.title, slug: p.slug, type: p.type, typeLabel: POST_TYPES[p.type as keyof typeof POST_TYPES],
    status: p.status, date: fmtDate(p.publishedAt ?? p.createdAt), author: p.authorName, views: p.views, coverUrl: p.coverUrl, trashed: !!p.deletedAt,
  }));

  if (rows.length === 0)
    return <EmptyState title={trash ? "Trash is empty" : "No posts found"} hint={search || status ? "Nothing matches these filters." : "Create your first post to see it here."} clearHref={search || status || typeP ? "?" : undefined}
      action={<Link href={`${editBase}/new`} className="btn btn-red"><Plus size={16} /> New post</Link>} />;

  return (
    <>
      <PostsTable rows={rows} editBase={editBase} />
      <DataPagination page={page} pageSize={pageSize} total={total} />
    </>
  );
}

export function PostList({ sp, title, crumb, fixedType, editBase }: { sp: SP; title: string; crumb: string; fixedType?: string; editBase: string }) {
  const key = JSON.stringify(sp);
  return (
    <>
      <PageHeader crumb={crumb} title={title} actions={<Link href={`${editBase}/new${fixedType ? `?type=${fixedType}` : ""}`} className="btn btn-red"><Plus size={16} /> New post</Link>} />
      <div className="card overflow-visible rounded-[18px]">
        <Suspense>
          <ListToolbar
            searchPlaceholder="Search title, slug or tag…"
            filters={[
              { key: "status", label: "Status", options: [{ value: "all", label: "All" }, { value: "PUBLISHED", label: "Published" }, { value: "SCHEDULED", label: "Scheduled" }, { value: "DRAFT", label: "Draft" }, { value: "TRASH", label: "Trash" }] },
              ...(fixedType ? [] : [{ key: "type", label: "Type", options: [{ value: "all", label: "All" }, ...Object.entries(POST_TYPES).map(([value, label]) => ({ value, label }))] }]),
            ]}
            sorts={[{ value: "createdAt", label: "Created" }, { value: "publishedAt", label: "Publish date" }, { value: "title", label: "Title" }, { value: "views", label: "Views" }]}
            defaultSort="createdAt"
          />
        </Suspense>
        <Suspense key={key} fallback={<TableSkeleton cols={5} rows={8} />}>
          <Data sp={sp} fixedType={fixedType} editBase={editBase} />
        </Suspense>
      </div>
    </>
  );
}
