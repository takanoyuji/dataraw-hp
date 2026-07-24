import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getAllComments, deleteComment } from "@/lib/comments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  return NextResponse.json({ comments: getAllComments() });
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "id が必要です" }, { status: 400 });
  }
  return NextResponse.json({ success: deleteComment(id) });
}
