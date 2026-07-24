import { NextRequest, NextResponse } from "next/server";
import { getComments, addComment, countRecentByIp, hashIp } from "@/lib/comments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }
  return NextResponse.json({ comments: getComments(slug) });
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const slug = typeof data.slug === "string" ? data.slug.trim() : "";
    const name = typeof data.name === "string" ? data.name.trim() : "";
    const body = typeof data.body === "string" ? data.body.trim() : "";
    const website = typeof data.website === "string" ? data.website : "";

    // ハニーポット: ボットが隠しフィールドを埋めたら、成功を装って黙って破棄
    if (website) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!slug || !/^[a-z0-9-]{1,100}$/i.test(slug)) {
      return NextResponse.json({ error: "不正な記事です。" }, { status: 400 });
    }
    if (!name || name.length > 50) {
      return NextResponse.json(
        { error: "お名前は1〜50文字で入力してください。" },
        { status: 400 }
      );
    }
    if (!body || body.length > 2000) {
      return NextResponse.json(
        { error: "コメントは1〜2000文字で入力してください。" },
        { status: 400 }
      );
    }

    // レート制限: 同一IP（ハッシュ）から60秒に3件まで
    const ipHash = hashIp(clientIp(req));
    if (ipHash && countRecentByIp(ipHash, 60) >= 3) {
      return NextResponse.json(
        { error: "投稿が多すぎます。少し時間をおいてから再度お試しください。" },
        { status: 429 }
      );
    }

    const comment = addComment({ slug, name, body, ipHash });
    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
