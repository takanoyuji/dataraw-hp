import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getCategories, addCategory, updateCategory, deleteCategory } from "@/lib/categories";

export async function GET() {
  const categories = getCategories();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.id || !body.name) {
      return NextResponse.json({ error: "IDと名前は必須です" }, { status: 400 });
    }

    addCategory({
      id: body.id,
      name: body.name,
      description: body.description || "",
      color: body.color || "#3B82F6",
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const updated = updateCategory(body.id, body);
    if (!updated) {
      return NextResponse.json({ error: "カテゴリが見つかりません" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
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
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "IDが必要です" }, { status: 400 });
  }

  const deleted = deleteCategory(id);
  if (!deleted) {
    return NextResponse.json({ error: "カテゴリが見つかりません" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
