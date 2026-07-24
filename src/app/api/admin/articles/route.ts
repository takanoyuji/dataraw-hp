import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getAllArticles, saveArticle, deleteArticle, getArticleBySlug } from "@/lib/articles";

export async function GET() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  // Return all articles including unpublished
  const articles = getAllArticles();
  return NextResponse.json(articles);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { slug, ...article } = body;

    if (!slug || !article.title) {
      return NextResponse.json({ error: "スラッグとタイトルは必須です" }, { status: 400 });
    }

    // Check if slug already exists for new articles
    if (body._isNew && getArticleBySlug(slug)) {
      return NextResponse.json({ error: "このスラッグは既に使用されています" }, { status: 409 });
    }

    saveArticle(slug, {
      title: article.title,
      description: article.description || "",
      content: article.content || "",
      category: article.category || "",
      tags: article.tags || [],
      publishedAt: article.publishedAt || new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      author: article.author || "高野 悠司",
      thumbnail: article.thumbnail,
      published: article.published !== false,
    });

    return NextResponse.json({ success: true, slug });
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "スラッグが必要です" }, { status: 400 });
  }

  const deleted = deleteArticle(slug);
  if (!deleted) {
    return NextResponse.json({ error: "記事が見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
