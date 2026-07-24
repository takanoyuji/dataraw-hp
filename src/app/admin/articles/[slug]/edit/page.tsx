"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ArticleEditor } from "@/components/admin/article-editor";
import type { Article } from "@/types/article";

export default function EditArticlePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/articles")
      .then((r) => r.json())
      .then((articles: Article[]) => {
        const found = articles.find((a) => a.slug === slug);
        setArticle(found || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <AdminGuard>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          {loading ? (
            <div className="text-gray-400">読み込み中...</div>
          ) : article ? (
            <ArticleEditor initialData={article} />
          ) : (
            <div className="text-gray-400">記事が見つかりません</div>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
