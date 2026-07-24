"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/admin-guard";
import { Button } from "@/components/ui/button";

interface AdminComment {
  id: number;
  article_slug: string;
  name: string;
  body: string;
  created_at: string;
  status: string;
}

export default function AdminCommentsPage() {
  return (
    <AdminGuard>
      <CommentsAdmin />
    </AdminGuard>
  );
}

function CommentsAdmin() {
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    fetch("/api/admin/comments")
      .then((r) => r.json())
      .then((d) => setComments(Array.isArray(d.comments) ? d.comments : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function del(id: number) {
    if (!confirm("このコメントを削除しますか？")) return;
    const res = await fetch(`/api/admin/comments?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:py-14">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">コメント管理</h1>
        <a href="/admin" className="text-sm text-blue-600 hover:underline">
          ← 管理トップ
        </a>
      </div>

      {loading ? (
        <p className="text-gray-400">読み込み中...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">コメントはありません。</p>
      ) : (
        <ul className="space-y-4">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-gray-200 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-bold text-gray-900">{c.name}</span>
                <span className="text-gray-400">{c.created_at}</span>
                <a
                  href={`/articles/${c.article_slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  /{c.article_slug}
                </a>
                {c.status !== "visible" && (
                  <span className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-600">
                    {c.status}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700">
                {c.body}
              </p>
              <div className="mt-3">
                <Button
                  onClick={() => del(c.id)}
                  className="h-8 bg-red-600 px-3 text-xs text-white hover:bg-red-700"
                >
                  削除
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
