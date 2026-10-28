import { currentWho } from "@/lib/shinjin/auth";
import { addAttempt, countRecentAttempts } from "@/lib/shinjin/db";
import { EPS } from "@/lib/shinjin/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 1話分の結果を保存する。誰の記録か・どの会社かはセッションで決め、本文の値は使わない。
 * 点数はブラウザで計算して送られてくるので、開発者ツールで書きかえられる。研修の目安として使い、評価には使わない
 */

const int = (v: unknown, lo: number, hi: number) => (Number.isInteger(v) && (v as number) >= lo && (v as number) <= hi ? (v as number) : null);
const str = (v: unknown, max: number) => (typeof v === "string" ? v.slice(0, max) : null);
const starsOf = (pts: number) => (pts >= 100 ? 3 : pts >= 70 ? 2 : pts >= 40 ? 1 : 0);

export async function POST(req: Request) {
  const who = await currentWho();
  if (!who) return Response.json({ error: "ログインが必要です" }, { status: 401 });

  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return Response.json({ error: "形が正しくありません" }, { status: 400 }); }

  const ep = typeof b.ep === "string" && EPS.includes(b.ep) ? b.ep : null;
  const no = int(b.no, 1, 10), pts = int(b.pts, 0, 100), st = int(b.stars, 0, 3), title = str(b.title, 100);
  const minus = Array.isArray(b.minus) && b.minus.length <= 40 ? b.minus : null;
  const path = Array.isArray(b.path) && b.path.length <= 40 ? b.path : null;
  if (!ep || no !== EPS.indexOf(ep) + 1 || pts === null || st !== starsOf(pts) || !title || !minus || !path) {
    return Response.json({ error: "形が正しくありません" }, { status: 400 });
  }
  const cleanMinus = minus.map((m) => ({ pt: int((m as { pt?: unknown })?.pt, 0, 100) ?? 0, why: str((m as { why?: unknown })?.why, 200) ?? "" })).filter((m) => m.why);
  const cleanPath = path.map((p) => {
    const o = (p ?? {}) as Record<string, unknown>;
    return { id: str(o.id, 40) ?? "", text: str(o.text, 300) ?? "", note: str(o.note, 300) ?? "" };
  });

  // 1人1日300回まで（1話5分なので、ふつうに遊んで届く数ではない）
  if (countRecentAttempts(who.member.id, 86400) >= 300) return Response.json({ error: "多すぎます" }, { status: 429 });

  addAttempt({
    member_id: who.member.id, company_id: who.company.id, ep, no, title, pts, stars: st, down: b.down === true ? 1 : 0,
    minus: JSON.stringify(cleanMinus), path: JSON.stringify(cleanPath), game_version: str(b.v, 20),
  });
  return Response.json({ ok: true });
}
