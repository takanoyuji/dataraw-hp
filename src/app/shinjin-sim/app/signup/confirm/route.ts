import { NextResponse } from "next/server";
import { sameOrigin, sessionCookie, startSession } from "@/lib/shinjin/auth";
import { getMemberInCompany } from "@/lib/shinjin/db";
import { BASE, esc, page, redirect } from "@/lib/shinjin/html";
import { completeSignup, normPhone, notifyNewTrial, peekSignup, TRIAL_DAYS, TRIAL_SEATS } from "@/lib/shinjin/signup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET は確認画面だけ。メールのウイルス検査がリンクを先に開いても、会社は作られない
// 古い相談フォームから来た申し込みは電話番号が無いので、ここで入れてもらう
const phoneFields = (err: string) => `
    ${err ? `<p class="msg ng">${esc(err)}</p>` : ""}
    <label>電話番号<input name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="03-1234-5678" required></label>
    <label style="display:flex;gap:8px;align-items:center;font-weight:400"><input name="agree" type="checkbox" value="1" required style="width:20px;height:20px">
      <span><a href="/privacy-policy" target="_blank" rel="noopener">プライバシーポリシー</a>に同意する</span></label>`;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const t = q.get("t") ?? "";
  const s = peekSignup(t);
  if (!s) return redirect(`${BASE}?m=signup_expired`);
  const err = q.get("e") === "phone" ? "電話番号を確かめてください（例: 03-1234-5678）。" : q.get("e") === "agree" ? "プライバシーポリシーへの同意が必要です。" : "";
  return page("トライアルをはじめる", `
<section class="card narrow">
  <p class="sub">無料トライアル（${TRIAL_SEATS}人・${TRIAL_DAYS}日間）</p>
  <h1>${esc(s.company)}</h1>
  <p class="sub">${esc(s.name)} 様（${esc(s.email)}）を、人事のご担当として登録します。</p>
  <form class="stack" method="post" action="${BASE}/signup/confirm"><input type="hidden" name="t" value="${esc(t)}">${s.phone ? "" : phoneFields(err)}
    <button class="btn big" type="submit">トライアルをはじめる</button></form>
  <p class="note">※終わっても自動で有料にはなりません<br>※このブラウザでログインします。30日間はログインしたままです</p>
</section>`);
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("forbidden", { status: 403 });
  const f = await req.formData();
  const t = String(f.get("t") ?? "");
  const s = peekSignup(t);
  if (!s) return redirect(`${BASE}?m=signup_expired`);
  let phone: string | undefined;
  if (!s.phone) {
    const back = (e: string) => redirect(`${BASE}/signup/confirm?t=${encodeURIComponent(t)}&e=${e}`);
    phone = normPhone(String(f.get("phone") ?? "").slice(0, 30)) ?? undefined;
    if (!phone) return back("phone");
    if (!f.get("agree")) return back("agree");
  }
  const r = completeSignup(t, phone);
  if (r === "expired") return redirect(`${BASE}?m=signup_expired`);
  if (r === "dup") return redirect(`${BASE}?m=signup_dup`);
  const me = getMemberInCompany(r.company.id, r.memberId)!;
  notifyNewTrial(r.company, me.name, me.email).catch((e) => console.error("[shinjin] 運営への知らせを送れませんでした:", e instanceof Error ? e.message : e));
  const res = new NextResponse(null, { status: 303, headers: { location: `${BASE}/admin?m=welcome` } });
  res.cookies.set(sessionCookie(startSession(r.memberId)));
  return res;
}
