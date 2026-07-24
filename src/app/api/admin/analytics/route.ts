import { NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/admin-auth";
import { getStats } from "@/lib/track";
import { getArticleBySlug } from "@/lib/articles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "認証が必要です" }, { status: 401 });
  }
  const stats = getStats().map((s) => ({
    ...s,
    title: getArticleBySlug(s.slug)?.title ?? s.slug,
  }));
  return NextResponse.json({ stats });
}
