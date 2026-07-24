"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { Category } from "@/types/article";

export default function CategoriesPage() {
  return (
    <AdminGuard>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <CategoriesContent />
        </div>
      </div>
    </AdminGuard>
  );
}

function CategoriesContent() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", description: "", color: "#3B82F6" });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      setCategories(await res.json());
    } catch {
      toast.error("取得に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.id || !form.name) {
      toast.error("IDと名前は必須です");
      return;
    }

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("カテゴリを追加しました");
      setShowNew(false);
      setForm({ id: "", name: "", description: "", color: "#3B82F6" });
      fetchCategories();
    } else {
      toast.error("追加に失敗しました");
    }
  }

  async function handleUpdate() {
    const res = await fetch("/api/admin/categories", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      toast.success("カテゴリを更新しました");
      setEditing(null);
      fetchCategories();
    } else {
      toast.error("更新に失敗しました");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("このカテゴリを削除しますか？")) return;

    const res = await fetch(`/api/admin/categories?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("カテゴリを削除しました");
      fetchCategories();
    } else {
      toast.error("削除に失敗しました");
    }
  }

  function startEdit(cat: Category) {
    setEditing(cat.id);
    setForm(cat);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">カテゴリ管理</h1>
        <Button
          onClick={() => {
            setShowNew(true);
            setForm({ id: "", name: "", description: "", color: "#3B82F6" });
          }}
          className="gradient-btn text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          新規カテゴリ
        </Button>
      </div>

      {showNew && (
        <div className="glass-card p-4 mb-6">
          <h3 className="font-bold mb-3">新規カテゴリ</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs">ID (英数字)</Label>
              <Input
                value={form.id}
                onChange={(e) => setForm((f) => ({ ...f, id: e.target.value.replace(/[^a-z0-9-]/g, "") }))}
                className="mt-1 bg-white/5 border-white/10"
                placeholder="category-id"
              />
            </div>
            <div>
              <Label className="text-xs">名前</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="mt-1 bg-white/5 border-white/10"
                placeholder="カテゴリ名"
              />
            </div>
            <div>
              <Label className="text-xs">説明</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="mt-1 bg-white/5 border-white/10"
                placeholder="説明"
              />
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">色</Label>
                <Input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="mt-1 bg-white/5 border-white/10 h-9"
                />
              </div>
              <Button onClick={handleAdd} size="sm" className="gradient-btn text-white">
                <Check className="h-4 w-4" />
              </Button>
              <Button onClick={() => setShowNew(false)} size="sm" variant="ghost">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left p-4 text-sm text-gray-400 font-medium">色</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">ID</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">名前</th>
              <th className="text-left p-4 text-sm text-gray-400 font-medium">説明</th>
              <th className="text-right p-4 text-sm text-gray-400 font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  読み込み中...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">
                  カテゴリがありません
                </td>
              </tr>
            ) : (
              categories.map((cat) =>
                editing === cat.id ? (
                  <tr key={cat.id}>
                    <td className="p-4">
                      <input
                        type="color"
                        value={form.color}
                        onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                        className="w-8 h-8 rounded"
                      />
                    </td>
                    <td className="p-4 text-sm text-gray-500">{cat.id}</td>
                    <td className="p-4">
                      <Input
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        className="bg-white/5 border-white/10 h-8 text-sm"
                      />
                    </td>
                    <td className="p-4">
                      <Input
                        value={form.description}
                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                        className="bg-white/5 border-white/10 h-8 text-sm"
                      />
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={handleUpdate} size="sm" variant="ghost" className="text-green-400">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => setEditing(null)} size="sm" variant="ghost">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={cat.id}>
                    <td className="p-4">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </td>
                    <td className="p-4 text-sm text-gray-500">{cat.id}</td>
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4 text-sm text-gray-400">{cat.description}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => startEdit(cat)} size="sm" variant="ghost">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(cat.id)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
