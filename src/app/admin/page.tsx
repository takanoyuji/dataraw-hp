"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { Article } from "@/types/article";

export default function AdminDashboard() {
  return (
    <AdminGuard>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <DashboardContent />
        </div>
      </div>
    </AdminGuard>
  );
}

function DashboardContent() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/articles");
      if (res.ok) {
        setArticles(await res.json());
      }
    } catch {
      toast.error("記事の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // setState は fetch の await 後にのみ呼ばれるため同期更新ではない（ルールの誤検知）
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchArticles();
  }, [fetchArticles]);

  async function handleDelete(slug: string) {
    if (!confirm("この記事を削除しますか？")) return;

    try {
      const res = await fetch(`/api/admin/articles?slug=${slug}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("記事を削除しました");
        fetchArticles();
      }
    } catch {
      toast.error("削除に失敗しました");
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">ダッシュボード</h1>
        <Link href="/admin/articles/new">
          <Button className="gradient-btn text-white">
            <Plus className="h-4 w-4 mr-2" />
            新規記事
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-2xl font-bold">{articles.length}</p>
              <p className="text-sm text-gray-400">記事数</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold">
                {articles.filter((a) => a.published).length}
              </p>
              <p className="text-sm text-gray-400">公開中</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold">
                {articles.filter((a) => !a.published).length}
              </p>
              <p className="text-sm text-gray-400">下書き</p>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-sm text-gray-400 font-medium">タイトル</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">ステータス</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">公開日</th>
              <th className="text-right p-4 text-sm text-gray-400 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  読み込み中...
                </td>
              </tr>
            ) : articles.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  記事がありません
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.slug}>
                  <td className="p-4">
                    <Link
                      href={`/articles/${article.slug}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      {article.title}
                    </Link>
                  </td>
                  <td className="p-4">
                    <Badge
                      variant="secondary"
                      className={
                        article.published
                          ? "bg-green-500/20 text-green-300 border-0"
                          : "bg-yellow-500/20 text-yellow-300 border-0"
                      }
                    >
                      {article.published ? "公開" : "下書き"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-gray-400">
                    {article.publishedAt}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/articles/${article.slug}/edit`)
                        }
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(article.slug)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
