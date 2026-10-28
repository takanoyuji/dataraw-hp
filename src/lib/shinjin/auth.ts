import crypto from "crypto";
import { cookies } from "next/headers";
import { db, now, type Company, type Member } from "./db";

/**
 * ログインはパスワードを使わず、メールに届くリンクで行う。
 * - リンクのトークンとセッションは、ハッシュだけを保存する（DBが漏れても使えない）
 * - リンクは1回だけ使える。メールのウイルス検査がリンクを先に開いても消費されないよう、
 *   開いた画面のボタン（POST）で初めて消費する
 * - 会社が止まっている・本人が止まっている・トライアルが切れていると、ログインもセッションも通らない
 */

export const COOKIE = "shinjin_session";
const SESSION_DAYS = 30;
export const INVITE_HOURS = 24 * 7;
export const LOGIN_MINUTES = 30;

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");
const rand = () => crypto.randomBytes(32).toString("base64url");

export interface Who { member: Member; company: Company }

/** 会社と本人がどちらも使える状態か。トライアルは期限まで */
export function usable(member: Member, company: Company): boolean {
  if (member.status !== "active" || company.status !== "active") return false;
  if (company.plan === "trial" && company.trial_ends_at && company.trial_ends_at < now()) return false;
  return true;
}

function loadWho(memberId: number): Who | null {
  const member = db().prepare(`SELECT * FROM members WHERE id = ?`).get(memberId) as Member | undefined;
  if (!member) return null;
  const company = db().prepare(`SELECT * FROM companies WHERE id = ?`).get(member.company_id) as Company | undefined;
  if (!company || !usable(member, company)) return null;
  return { member, company };
}

// ── リンクのトークン ──
export function issueToken(memberId: number, purpose: "invite" | "login"): string {
  const raw = rand();
  const ttl = purpose === "invite" ? INVITE_HOURS * 3600_000 : LOGIN_MINUTES * 60_000;
  db().prepare(`INSERT INTO login_tokens (hash, member_id, purpose, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(sha(raw), memberId, purpose, new Date(Date.now() + ttl).toISOString(), now());
  return raw;
}
/** 直近 sinceSeconds 秒に出したログインリンクの数（送りすぎ防止） */
export function recentTokens(memberId: number, sinceSeconds: number): number {
  const cutoff = new Date(Date.now() - sinceSeconds * 1000).toISOString();
  return (db().prepare(`SELECT COUNT(*) AS c FROM login_tokens WHERE member_id = ? AND created_at >= ?`)
    .get(memberId, cutoff) as { c: number }).c;
}
/** 使えるトークンなら、その人を返す（消費はしない。確認画面用） */
export function peekToken(raw: string): Who | null {
  if (!raw || raw.length > 100) return null;
  const t = db().prepare(`SELECT * FROM login_tokens WHERE hash = ?`).get(sha(raw)) as
    { member_id: number; expires_at: string; used_at: string | null } | undefined;
  if (!t || t.used_at || t.expires_at < now()) return null;
  return loadWho(t.member_id);
}
/** トークンを消費して、セッションを作る。使えなければ null */
export function consumeToken(raw: string): { who: Who; session: string } | null {
  const who = peekToken(raw);
  if (!who) return null;
  // 同時に2回押されても、1回しか通らないよう used_at IS NULL を条件に更新する
  const ok = db().prepare(`UPDATE login_tokens SET used_at = ? WHERE hash = ? AND used_at IS NULL`).run(now(), sha(raw)).changes === 1;
  if (!ok) return null;
  return { who, session: startSession(who.member.id) };
}
/** セッションを作り、Cookie に入れる値を返す */
export function startSession(memberId: number): string {
  const session = rand();
  db().prepare(`INSERT INTO sessions (hash, member_id, expires_at, created_at) VALUES (?, ?, ?, ?)`)
    .run(sha(session), memberId, new Date(Date.now() + SESSION_DAYS * 86400_000).toISOString(), now());
  db().prepare(`UPDATE members SET last_login_at = ? WHERE id = ?`).run(now(), memberId);
  return session;
}

// ── セッション ──
export function sessionCookie(value: string, maxAgeDays = SESSION_DAYS) {
  return {
    name: COOKIE, value, httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const, maxAge: maxAgeDays * 86400, path: "/shinjin-sim/app",
  };
}
export async function currentWho(): Promise<Who | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw || raw.length > 100) return null;
  const s = db().prepare(`SELECT member_id, expires_at FROM sessions WHERE hash = ?`).get(sha(raw)) as
    { member_id: number; expires_at: string } | undefined;
  if (!s || s.expires_at < now()) return null;
  return loadWho(s.member_id);
}
export async function endSession(): Promise<void> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (raw) db().prepare(`DELETE FROM sessions WHERE hash = ?`).run(sha(raw));
}
/** 止めた人のセッションを消す（止めたらすぐ入れなくする） */
export function dropSessions(memberId: number): void {
  db().prepare(`DELETE FROM sessions WHERE member_id = ?`).run(memberId);
}

/** フォームのPOSTが、よそのサイトから来ていないか（SameSite=Lax に加えて Origin も見る） */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // 古いブラウザは付けないことがある。Cookie の SameSite=Lax で守る
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  try { return new URL(origin).host === host; } catch { return false; }
}
