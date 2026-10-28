import { NextResponse } from "next/server";
import { sameOrigin, sessionCookie, startSession } from "@/lib/shinjin/auth";
import { getMemberInCompany } from "@/lib/shinjin/db";
import { BASE, esc, page, redirect } from "@/lib/shinjin/html";
import { completeSignup, notifyNewTrial, peekSignup, TRIAL_DAYS, TRIAL_SEATS } from "@/lib/shinjin/signup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET は確認画面だけ。メールのウイルス検査がリンクを先に開いても、会社は作られない
export async function GET(req: Request) {
  const t = new URL(req.url).searchParams.get("t") ?? "";
  const s = peekSignup(t);
  if (!s) return redirect(`${BASE}?m=signup_expired`);
  return page("トライアルをはじめる", `
<section class="card narrow">
  <p class="sub">無料トライアル（${TRIAL_SEATS}人・${TRIAL_DAYS}日間）</p>
  <h1>${esc(s.company)}</h1>
  <p class="sub">${esc(s.name)} 様（${esc(s.email)}）を、人事のご担当として登録します。</p>
  <form method="post" action="${BASE}/signup/confirm"><input type="hidden" name="t" value="${esc(t)}">
    <button class="btn big" type="submit">トライアルをはじめる</button></form>
  <p class="note">※終わっても自動で有料にはなりません<br>※このブラウザでログインします。30日間はログインしたままです</p>
</section>`);
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("forbidden", { status: 403 });
  const t = String((await req.formData()).get("t") ?? "");
  const r = completeSignup(t);
  if (r === "expired") return redirect(`${BASE}?m=signup_expired`);
  if (r === "dup") return redirect(`${BASE}?m=signup_dup`);
  const s = getMemberInCompany(r.company.id, r.memberId)!;
  notifyNewTrial(r.company, s.name, s.email).catch((e) => console.error("[shinjin] 運営への知らせを送れませんでした:", e instanceof Error ? e.message : e));
  const res = new NextResponse(null, { status: 303, headers: { location: `${BASE}/admin?m=welcome` } });
  res.cookies.set(sessionCookie(startSession(r.memberId)));
  return res;
}
