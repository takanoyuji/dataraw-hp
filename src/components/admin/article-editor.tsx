"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Eye, X } from "lucide-react";
import { toast } from "sonner";
import { ArticleContent } from "@/components/articles/article-content";
import type { Category } from "@/types/article";

interface ArticleEditorProps {
  initialData?: {
    slug: string;
    title: string;
    description: string;
    content: string;
    category: string;
    tags: string[];
    publishedAt: string;
    author: string;
    published: boolean;
  };
  isNew?: boolean;
}

export function ArticleEditor({ initialData, isNew = false }: ArticleEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    slug: initialData?.slug || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    category: initialData?.category || "",
    tags: initialData?.tags || [],
    publishedAt: initialData?.publishedAt || new Date().toISOString().split("T")[0],
    author: initialData?.author || "高野 悠司",
    published: initialData?.published ?? true,
  });

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((f) => ({ ...f, tags: [...f.tags, tag] }));
      setTagInput("");
    }
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  async function handleSave() {
    if (!form.slug || !form.title) {
      toast.error("スラッグとタイトルは必須です");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, _isNew: isNew }),
      });

      if (res.ok) {
        toast.success(isNew ? "記事を作成しました" : "記事を更新しました");
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "保存に失敗しました");
      }
    } catch {
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {isNew ? "新規記事作成" : "記事編集"}
        </h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
              className="rounded border-gray-700"
            />
            公開
          </label>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gradient-btn text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main editor */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <Label>タイトル</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 bg-white/5 border-white/10"
              placeholder="記事のタイトル"
            />
          </div>

          {isNew && (
            <div>
              <Label>スラッグ (URL)</Label>
              <Input
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    slug: e.target.value.replace(/[^a-z0-9-]/g, ""),
                  }))
                }
                className="mt-1 bg-white/5 border-white/10"
                placeholder="article-slug"
              />
              <p className="text-xs text-gray-500 mt-1">
                /articles/{form.slug || "..."}
              </p>
            </div>
          )}

          <div>
            <Label>概要</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 bg-white/5 border-white/10"
              rows={2}
              placeholder="記事の概要"
            />
          </div>

          <Tabs defaultValue="edit">
            <TabsList className="bg-white/5">
              <TabsTrigger value="edit">編集</TabsTrigger>
              <TabsTrigger value="preview">
                <Eye className="h-4 w-4 mr-1" />
                プレビュー
              </TabsTrigger>
            </TabsList>
            <TabsContent value="edit">
              <Textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                className="bg-white/5 border-white/10 font-mono text-sm min-h-[500px]"
                placeholder="Markdownで記事を書く..."
              />
            </TabsContent>
            <TabsContent value="preview">
              <div className="glass-card p-6 min-h-[500px]">
                {form.content ? (
                  <ArticleContent content={form.content} />
                ) : (
                  <p className="text-gray-500">プレビューするコンテンツがありません</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <Label>カテゴリ</Label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="mt-1 w-full bg-white/5 border border-white/10 rounded-md px-3 py-2 text-sm"
            >
              <option value="">選択してください</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="glass-card p-4">
            <Label>タグ</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="bg-white/5 border-white/10"
                placeholder="タグを入力"
              />
              <Button
                type="button"
                onClick={addTag}
                variant="outline"
                size="sm"
                className="border-white/10"
              >
                追加
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {form.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-blue-500/20 text-blue-300 border-0 cursor-pointer"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <Label>公開日</Label>
            <Input
              type="date"
              value={form.publishedAt}
              onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value }))}
              className="mt-1 bg-white/5 border-white/10"
            />
          </div>

          <div className="glass-card p-4">
            <Label>著者</Label>
            <Input
              value={form.author}
              onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
              className="mt-1 bg-white/5 border-white/10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
