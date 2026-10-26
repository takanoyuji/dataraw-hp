import { cookies } from "next/headers";
import { createHash, createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 hours

// 2026-10-26: 以前はパスワードの32bitハッシュを固定のトークンにしていた。候補が約21億通りしかなく
// 総当たりで到達でき、失効もしなかった。今は「有効期限.署名」にし、署名鍵はパスワードから作る
// （パスワードを変えると発行済みのセッションも無効になる）

function adminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function signingKey(password: string): Buffer {
  return createHash("sha256").update(`dataraw-admin-session:${password}`).digest();
}

function sign(exp: string, password: string): string {
  return createHmac("sha256", signingKey(password)).update(exp).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** 入力されたパスワードが正しいか。ADMIN_PASSWORD が未設定なら常に false */
export function checkAdminPassword(input: unknown): boolean {
  const password = adminPassword();
  if (!password || typeof input !== "string") return false;
  // 長さの違いで早く返らないよう、ハッシュ同士を比べる
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(password).digest();
  return timingSafeEqual(a, b);
}

export function verifySessionToken(token: string | undefined): boolean {
  const password = adminPassword();
  if (!password || !token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;
  return safeEqual(sig, sign(exp, password));
}

export async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  return verifySessionToken(cookieStore.get(COOKIE_NAME)?.value);
}

export function createSessionToken(): string {
  const password = adminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD が設定されていません");
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_MAX_AGE);
  return `${exp}.${sign(exp, password)}`;
}

export function getSessionCookieConfig() {
  return {
    name: COOKIE_NAME,
    value: createSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}
