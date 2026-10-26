import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword, getSessionCookieConfig, verifyAdmin } from "@/lib/admin-auth";

// 総当たり対策: 同じIPから15分に10回まで失敗を許す（コンテナ1つなのでメモリで数える）
const FAIL_LIMIT = 10;
const FAIL_WINDOW_MS = 15 * 60 * 1000;
const failures = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: NextRequest): string {
  // nginx が上書きする X-Real-IP を使う（X-Forwarded-For の先頭は偽れる）
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

function isLocked(ip: string): boolean {
  const f = failures.get(ip);
  if (!f || f.resetAt <= Date.now()) return false;
  return f.count >= FAIL_LIMIT;
}

function recordFailure(ip: string) {
  const now = Date.now();
  const f = failures.get(ip);
  if (!f || f.resetAt <= now) failures.set(ip, { count: 1, resetAt: now + FAIL_WINDOW_MS });
  else f.count += 1;
}

export async function POST(request: NextRequest) {
  try {
    const ip = clientIp(request);
    if (isLocked(ip)) {
      return NextResponse.json(
        { error: "試行回数が多すぎます。しばらく待ってから再度お試しください" },
        { status: 429 }
      );
    }

    const { password } = await request.json();
    if (!checkAdminPassword(password)) {
      recordFailure(ip);
      return NextResponse.json({ error: "パスワードが正しくありません" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    const cookie = getSessionCookieConfig();
    response.cookies.set(cookie.name, cookie.value, {
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
      maxAge: cookie.maxAge,
      path: cookie.path,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "サーバーエラー" }, { status: 500 });
  }
}

export async function GET() {
  const isAdmin = await verifyAdmin();
  return NextResponse.json({ authenticated: isAdmin });
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
