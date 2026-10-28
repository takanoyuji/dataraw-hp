import { recentTokens, sameOrigin, usable } from "@/lib/shinjin/auth";
import { getCompany, getMemberByEmail } from "@/lib/shinjin/db";
import { BASE, redirect } from "@/lib/shinjin/html";
import { sendLoginLink } from "@/lib/shinjin/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 同じIPから10分に10回まで（登録の有無を総当たりで調べられないよう、結果はいつも同じ画面）
const hits = new Map<string, { n: number; reset: number }>();
function tooMany(ip: string): boolean {
  const t = Date.now(), h = hits.get(ip);
  if (!h || h.reset < t) { hits.set(ip, { n: 1, reset: t + 600_000 }); return false; }
  return ++h.n > 10;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("forbidden", { status: 403 });
  const form = await req.formData();
  const email = String(form.get("email") ?? "").slice(0, 254);
  const ip = req.headers.get("x-real-ip") ?? "local";
  if (!tooMany(ip)) {
    const m = email ? getMemberByEmail(email) : undefined;
    const c = m ? getCompany(m.company_id) : undefined;
    if (m && c && usable(m, c) && recentTokens(m.id, 600) < 3) {
      // 待たずに返す（送る相手がいるかどうかが、返るまでの時間で分からないように）
      sendLoginLink(m).catch((e) => console.error("[shinjin] ログインリンクの送信に失敗:", e instanceof Error ? e.message : e));
    }
  }
  return redirect(`${BASE}?m=sent`);
}
