"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

const menuItems = [
  { href: "/admin", icon: LayoutDashboard, label: "ダッシュボード" },
  { href: "/admin/articles/new", icon: Plus, label: "新規記事" },
  { href: "/admin/categories", icon: FolderOpen, label: "カテゴリ管理" },
  { href: "/admin/analytics", icon: BarChart3, label: "アクセス・読了" },
  { href: "/admin/comments", icon: MessageCircle, label: "コメント" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    toast.success("ログアウトしました");
    router.push("/admin/login");
  }

  return (
    <aside className="w-64 glass-card rounded-none min-h-[calc(100vh-4rem)] p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-bold gradient-text">管理画面</h2>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-blue-500/20 text-blue-400"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
      >
        <LogOut className="h-4 w-4" />
        ログアウト
      </button>
    </aside>
  );
}
