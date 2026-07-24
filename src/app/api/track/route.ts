import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { recordEvent, EventKind } from "@/lib/track";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "0.0.0.0";
}

/** 訪問者ハッシュ = IP + UA + 当日 + ソルト。生値は保存しない。日跨ぎで追跡しない */
function visitorHash(req: NextRequest, day: string): string {
  const ip = clientIp(req);
  const ua = req.headers.get("user-agent") || "";
  const salt = process.env.COMMENTS_IP_SALT || "dataraw-analytics-salt";
  return crypto
    .createHash("sha256")
    .update(`${ip}|${ua}|${day}|${salt}`)
    .digest("hex")
    .slice(0, 32);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const slug = typeof data.slug === "string" ? data.slug.trim() : "";
    const kind = data.kind as EventKind;

    if (!slug || !/^[a-z0-9-]{1,100}$/i.test(slug)) {
      return NextResponse.json({ error: "bad slug" }, { status: 400 });
    }
    if (kind !== "view" && kind !== "read") {
      return NextResponse.json({ error: "bad kind" }, { status: 400 });
    }

    // 当日(サーバー時刻・JST基準)を YYYY-MM-DD で
    const day = new Date().toLocaleDateString("sv-SE", {
      timeZone: "Asia/Tokyo",
    });
    recordEvent(slug, kind, visitorHash(req, day), day);

    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "server error" }, { status: 500 });
  }
}
