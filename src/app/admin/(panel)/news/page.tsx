import { PostList } from "@/components/admin/PostList";

export const metadata = { title: "News & Events" };

export default async function AdminNewsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PostList sp={await searchParams} title="News & Events" crumb="Content / News & Events" editBase="/admin/news" />;
}
