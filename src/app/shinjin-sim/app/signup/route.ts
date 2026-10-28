import { recentTokens, sameOrigin, usable } from "@/lib/shinjin/auth";
import { getCompany, getMemberByEmail } from "@/lib/shinjin/db";
import { sendLoginLink } from "@/lib/shinjin/mail";
import { checkInput, overDailyCap, overEmailCap, startSignup } from "@/lib/shinjin/signup";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * LP のフォームから fetch で呼ぶ。返事は JSON（{ ok: true } か { ok: false, error }）。
 * 登録済みのメールでも、画面には同じ「送りました」を返す（登録の有無を探られないため）
 */

// 同じIPから10分に3回まで
const hits = new Map<string, { n: number; reset: number }>();
function tooMany(ip: string): boolean {
  const t = Date.now(), h = hits.get(ip);
  if (!h || h.reset < t) { hits.set(ip, { n: 1, reset: t + 600_000 }); return false; }
  return ++h.n > 3;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ ok: false, error: "forbidden" }, 403);
  let form: FormData;
  try { form = await req.formData(); } catch { return json({ ok: false, error: "入力を確かめてください。" }, 400); }
  const get = (k: string) => String(form.get(k) ?? "").slice(0, 300);
  if (get("website")) return json({ ok: true }); // 見えない欄に入っていたら機械。送ったふりをする

  const c = checkInput({ company: get("company"), name: get("name"), email: get("email"), phone: get("phone"), agree: get("agree") });
  if (!c.ok) return json({ ok: false, error: c.error }, 400);

  const ip = req.headers.get("x-real-ip") ?? "local";
  if (tooMany(ip)) return json({ ok: false, error: "続けて送られています。10分ほど空けてから、もう一度お試しください。" }, 429);

  const m = getMemberByEmail(c.v.email);
  if (m) {
    // 登録済み: 使える状態ならログイン用のリンクを送る。返事は新規と同じ
    const co = getCompany(m.company_id);
    if (co && usable(m, co) && recentTokens(m.id, 600) < 3) {
      sendLoginLink(m).catch((e) => console.error("[shinjin] ログインリンクの送信に失敗:", e instanceof Error ? e.message : e));
    }
    return json({ ok: true });
  }
  if (overEmailCap(c.v.email)) return json({ ok: true });
  if (overDailyCap()) {
    console.error("[shinjin] 申し込みが1日の上限に達しました");
    return json({ ok: false, error: "申し込みが混み合っています。お手数ですが、時間をおいてもう一度お試しください。" }, 503);
  }
  try {
    await startSignup(c.v, ip);
  } catch (e) {
    console.error("[shinjin] 確認メールの送信に失敗:", e instanceof Error ? e.message : e);
    return json({ ok: false, error: "確認メールを送れませんでした。時間をおいてもう一度お試しください。" }, 502);
  }
  return json({ ok: true });
}
