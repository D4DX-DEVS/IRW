import { notFound } from "next/navigation";
import { PostEditor, type EditorPost } from "@/components/admin/PostEditor";
import { db } from "@/lib/db";
import { POST_TYPES, strParam } from "@/lib/utils";

export const metadata = { title: "Edit post" };

const toLocalInput = (d: Date | null) => {
  if (!d) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { id } = await params;
  const sp = await searchParams;
  let post: EditorPost;
  if (id === "new") {
    const t = strParam(sp.type);
    post = { id: null, coverUrl: null, status: "DRAFT", values: { title: "", slug: "", type: (t in POST_TYPES ? t : "NEWS") as keyof typeof POST_TYPES, excerpt: "", body: "", tags: "", featured: false, publishedAt: "", alt: "" } };
  } else {
    const p = await db.post.findUnique({ where: { id } });
    if (!p) notFound();
    post = {
      id: p.id, coverUrl: p.coverUrl, status: p.status,
      values: { title: p.title, slug: p.slug, type: p.type as keyof typeof POST_TYPES, excerpt: p.excerpt, body: p.body, tags: p.tags, featured: p.featured, publishedAt: toLocalInput(p.publishedAt), alt: "" },
    };
  }
  return <PostEditor key={id} post={post} listHref={post.values.type === "ACHIEVEMENT" ? "/admin/achievements" : "/admin/news"} />;
}
