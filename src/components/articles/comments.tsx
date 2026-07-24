"use client";

import { useCallback, useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface CommentItem {
  id: number;
  name: string;
  body: string;
  created_at: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function Comments({ slug }: { slug: string }) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [website, setWebsite] = useState(""); // ハニーポット
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/comments?slug=${encodeURIComponent(slug)}`)
      .then((r) => r.json())
      .then((d) => setComments(Array.isArray(d.comments) ? d.comments : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !body.trim()) {
      toast.error("お名前とコメントを入力してください。");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, body, website }),
      });
      const data = await res.json();
      if (res.ok && data.comment) {
        setComments((prev) => [...prev, data.comment]);
        setBody("");
        toast.success("コメントを投稿しました。");
      } else {
        toast.error(data.error || "投稿に失敗しました。");
      }
    } catch {
      toast.error("投稿に失敗しました。時間をおいて再度お試しください。");
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-12 md:mt-16">
      <div className="rounded-2xl bg-[#fbfbfd] px-5 py-8 shadow-2xl shadow-black/40 ring-1 ring-black/5 md:px-10 md:py-10">
        <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-[#1a2332]">
          <MessageCircle className="h-5 w-5 text-[#2563eb]" />
          コメント
          {comments.length > 0 && (
            <span className="text-gray-400">（{comments.length}）</span>
          )}
        </h2>

        {loading ? (
          <p className="text-sm text-gray-400">読み込み中...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-gray-500">
            まだコメントはありません。最初のコメントをどうぞ。
          </p>
        ) : (
          <ul className="space-y-5">
            {comments.map((c) => (
              <li
                key={c.id}
                className="border-b border-gray-200 pb-5 last:border-0 last:pb-0"
              >
                <div className="mb-1 flex flex-wrap items-baseline gap-x-3">
                  <span className="font-bold text-[#1a2332]">{c.name}</span>
                  <span className="text-xs text-gray-400">
                    {formatDate(c.created_at)}
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words text-[0.95rem] leading-[1.85] text-gray-700">
                  {c.body}
                </p>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={handleSubmit} className="mt-8 border-t border-gray-200 pt-6">
          <p className="mb-4 text-sm font-bold text-[#1a2332]">コメントを書く</p>

          {/* ハニーポット（人間には見えない。ボット対策）。
              Tailwindの任意値クラスに依存せず、確実に画面外へ隠すためインラインstyleを使う。 */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              width: 1,
              height: 1,
              padding: 0,
              margin: -1,
              overflow: "hidden",
              clip: "rect(0, 0, 0, 0)",
              whiteSpace: "nowrap",
              border: 0,
            }}
          >
            <label>
              Website
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>
          </div>

          <div className="space-y-3">
            <Input
              type="text"
              placeholder="お名前"
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
            />
            <Textarea
              placeholder="コメント（プレーンテキスト・最大2000文字）"
              rows={4}
              maxLength={2000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="resize-none border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-gray-400">
                投稿すると即時に公開されます。
              </span>
              <Button
                type="submit"
                disabled={sending}
                className="bg-[#2563eb] text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? "送信中..." : "投稿する"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
