import { NextResponse } from "next/server";
import { consumeToken, peekToken, sameOrigin, sessionCookie } from "@/lib/shinjin/auth";
import { BASE, esc, page, redirect } from "@/lib/shinjin/html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET は確認画面だけ。メールのウイルス検査がリンクを先に開いても、トークンは消費されない
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") ?? "";
  const who = peekToken(t);
  if (!who) return redirect(`${BASE}?m=expired`);
  return page("ログイン", `
<section class="card narrow">
  <p class="sub">${esc(who.company.name)}</p>
  <h1>${esc(who.member.name)} さん、ようこそ</h1>
  <p class="sub">このブラウザでログインします。30日間はログインしたままです。</p>
  <form method="post" action="${BASE}/auth"><input type="hidden" name="t" value="${esc(t)}">
    <button class="btn big" type="submit">はじめる</button></form>
</section>`);
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("forbidden", { status: 403 });
  const t = String((await req.formData()).get("t") ?? "");
  const r = consumeToken(t);
  if (!r) return redirect(`${BASE}?m=expired`);
  const res = new NextResponse(null, { status: 303, headers: { location: r.who.member.role === "admin" ? `${BASE}/admin` : BASE } });
  res.cookies.set(sessionCookie(r.session));
  return res;
}
