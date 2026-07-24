"use client";

import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { ArticleEditor } from "@/components/admin/article-editor";

export default function NewArticlePage() {
  return (
    <AdminGuard>
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <ArticleEditor isNew />
        </div>
      </div>
    </AdminGuard>
  );
}
