import { PostList } from "@/components/admin/PostList";

export const metadata = { title: "Achievements" };

export default async function AdminAchievementsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <PostList sp={await searchParams} title="Achievements" crumb="Content / Achievements" fixedType="ACHIEVEMENT" editBase="/admin/news" />;
}
