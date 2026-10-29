import crypto from "crypto";
import { sendMail } from "@/lib/smtp";
import { addMember, createCompany, db, getCompany, getMemberByEmail, normEmail, now, type Company } from "./db";
import { BASE, SITE_URL } from "./html";

/**
 * LP からの無料トライアルの申し込み（2026-10-29〜）。
 * - 申し込みでは会社を作らない。メールの確認リンクを開き、確認画面のボタン（POST）を押したときに作る
 *   （存在しないアドレスや、他人のアドレスで会社が作られないため）
 * - 送りすぎ防止: 同じIP 10分に3回 / 同じメール 24時間に3回 / 全体 24時間に50通
 * - 作ったら運営（CONTACT_TO）に知らせる。トライアル終了の2日前にも知らせる
 * - 古いLP（相談フォーム）から /api/contact に来た分も、申込者に確認リンクを送る。電話番号は確認画面で入れてもらう
 */

export const TRIAL_DAYS = 14;
export const TRIAL_SEATS = 5;
export const SIGNUP_HOURS = 24;
const DAILY_CAP = 50;
const FROM = "新人しごとシミュレーター";

const sha = (s: string) => crypto.createHash("sha256").update(s).digest("hex");

export interface SignupInput { company: string; name: string; email: string; phone: string }
interface SignupRow extends SignupInput { id: number; expires_at: string; used_at: string | null }

/** 電話番号を数字だけにそろえる（全角・ハイフン・+81 を受ける）。日本の番号でなければ null */
export function normPhone(s: string): string | null {
  let d = s.replace(/[０-９＋]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0)).replace(/[\s\-‐－ー()（）]/g, "");
  if (d.startsWith("+81")) d = "0" + d.slice(3);
  return /^0\d{9,10}$/.test(d) ? d : null;
}

/** 入力を確かめる。だめなら、画面に出す理由を返す */
export function checkInput(f: Record<string, string>): { ok: true; v: SignupInput } | { ok: false; error: string } {
  const company = f.company.trim(), name = f.name.trim(), email = normEmail(f.email), phone = normPhone(f.phone);
  if (!company || company.length > 100) return { ok: false, error: "会社名を入れてください。" };
  if (!name || name.length > 50) return { ok: false, error: "お名前を入れてください。" };
  if (email.length > 254 || !/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(email)) return { ok: false, error: "メールアドレスを確かめてください。" };
  if (!phone) return { ok: false, error: "電話番号を確かめてください（例: 03-1234-5678）。" };
  if (!f.agree) return { ok: false, error: "プライバシーポリシーへの同意が必要です。" };
  return { ok: true, v: { company, name, email, phone } };
}

function countSince(sql: string, sinceSeconds: number, ...args: unknown[]): number {
  const cutoff = new Date(Date.now() - sinceSeconds * 1000).toISOString();
  return (db().prepare(sql).get(cutoff, ...args) as { c: number }).c;
}
/** 全体の上限に達しているか */
export function overDailyCap(): boolean {
  return countSince(`SELECT COUNT(*) AS c FROM signups WHERE created_at >= ?`, 86400) >= DAILY_CAP;
}
/** 同じメールに送りすぎていないか */
export function overEmailCap(email: string): boolean {
  return countSince(`SELECT COUNT(*) AS c FROM signups WHERE created_at >= ? AND email = ?`, 86400, normEmail(email)) >= 3;
}

/** 申し込みを残して、確認メールを送る */
export async function startSignup(v: SignupInput, ip: string): Promise<void> {
  const raw = crypto.randomBytes(32).toString("base64url");
  db().prepare(`INSERT INTO signups (hash, company, name, email, phone, ip, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .run(sha(raw), v.company, v.name, v.email, v.phone, ip, new Date(Date.now() + SIGNUP_HOURS * 3600_000).toISOString(), now());
  await sendMail({
    to: v.email, fromName: FROM,
    subject: "【新人しごとシミュレーター】無料トライアルのお申し込み確認",
    text: [
      `${v.company}`,
      `${v.name} 様`,
      "",
      "新人しごとシミュレーター 法人プランの無料トライアルにお申し込みいただき、ありがとうございます。",
      "下のリンクを開き、「トライアルをはじめる」を押すと、管理画面に入れます。",
      "",
      `${SITE_URL}${BASE}/signup/confirm?t=${raw}`,
      "",
      `※リンクの有効期限は${SIGNUP_HOURS}時間、1回だけ使えます。`,
      `※トライアルは${TRIAL_SEATS}人・${TRIAL_DAYS}日間。終わっても自動で有料にはなりません。`,
      "※お申し込みに心当たりがなければ、このメールは捨ててください。リンクを開かなければ何も登録されません。",
      "",
      "--",
      "新人しごとシミュレーター（運営: 合同会社データロー）",
      `${SITE_URL}/shinjin-sim`,
    ].join("\n"),
  });
}

/**
 * 古い相談フォームから来た申し込みに、確認リンクを送る（電話番号は確認画面で入れてもらう）。
 * 運営への知らせに書くため、どうしたかを返す
 */
export async function offerSignup(v: { company: string; name: string; email: string }, ip: string): Promise<string> {
  const m = getMemberByEmail(v.email);
  if (m) {
    const c = getCompany(m.company_id);
    return `登録済みのメールです（会社: ${c?.name ?? "-"}）。リンクは送っていません`;
  }
  if (overEmailCap(v.email) || overDailyCap()) return "送りすぎ防止の上限に達したため、リンクは送っていません";
  try {
    await startSignup({ company: v.company.slice(0, 100), name: v.name.slice(0, 50), email: normEmail(v.email), phone: "" }, ip);
    return "申込者にトライアル開始の確認リンクを送りました（電話番号はリンク先で入力）";
  } catch (e) {
    console.error("[shinjin] 確認メールの送信に失敗:", e instanceof Error ? e.message : e);
    return "確認リンクを送れませんでした。申込者に連絡してください";
  }
}

/** 使える確認リンクなら、申し込みの中身を返す（確認画面用。消費はしない） */
export function peekSignup(raw: string): SignupRow | null {
  if (!raw || raw.length > 100) return null;
  const r = db().prepare(`SELECT * FROM signups WHERE hash = ?`).get(sha(raw)) as SignupRow | undefined;
  if (!r || r.used_at || r.expires_at < now()) return null;
  return r;
}

/**
 * 確認リンクを消費して、会社と人事（admin）を作る。
 * すでに同じメールが登録済みなら作らずに "dup" を返す（その間に別の申し込みで作られた場合も含む）
 */
export function completeSignup(raw: string, phone?: string): { memberId: number; company: Company } | "expired" | "dup" {
  const r = peekSignup(raw);
  if (!r) return "expired";
  if (!r.phone && phone) r.phone = phone; // 古いフォームから来た分は、確認画面で入れた番号
  const tx = db().transaction(() => {
    const ok = db().prepare(`UPDATE signups SET used_at = ? WHERE id = ? AND used_at IS NULL`).run(now(), r.id).changes === 1;
    if (!ok) return "expired" as const;
    if (getMemberByEmail(r.email)) return "dup" as const;
    const cid = createCompany(r.company, TRIAL_DAYS, TRIAL_SEATS, { phone: r.phone, source: "self" });
    const memberId = addMember(cid, { email: r.email, name: r.name, dept: "", role: "admin" });
    db().prepare(`UPDATE members SET invited_at = ? WHERE id = ?`).run(now(), memberId);
    db().prepare(`UPDATE signups SET company_id = ?, phone = ? WHERE id = ?`).run(cid, r.phone, r.id);
    return { memberId, company: getCompany(cid)! };
  });
  return tx();
}

const jstDate = (iso: string | null) => (iso ? new Date(Date.parse(iso) + 9 * 3600_000).toISOString().slice(0, 16).replace("T", " ") : "-");

/** 運営への知らせ（申し込みで会社ができた） */
export async function notifyNewTrial(c: Company, name: string, email: string): Promise<void> {
  await sendMail({
    fromName: FROM, replyTo: email,
    subject: `【新人しごとシミュレーター】トライアル開始: ${c.name}`,
    text: [
      "LP から無料トライアルが始まりました。",
      "",
      `会社: ${c.name}`,
      `担当: ${name}`,
      `メール: ${email}`,
      `電話: ${c.phone}`,
      `終了: ${jstDate(c.trial_ends_at)}（${TRIAL_SEATS}人・${TRIAL_DAYS}日間）`,
      "",
      `運営画面: ${SITE_URL}${BASE}/ops`,
    ].join("\n"),
  });
}

/** トライアル終了の2日前に、運営へ知らせる（1社1回。7日延長したら、もう一度知らせる） */
export async function notifyTrialEnds(): Promise<void> {
  const soon = new Date(Date.now() + 2 * 86400_000).toISOString();
  const rows = db().prepare(
    `SELECT * FROM companies WHERE plan = 'trial' AND status = 'active' AND end_notified_at IS NULL AND trial_ends_at <= ? AND trial_ends_at > ?`
  ).all(soon, now()) as Company[];
  for (const c of rows) {
    const admins = db().prepare(`SELECT name, email FROM members WHERE company_id = ? AND role = 'admin'`).all(c.id) as { name: string; email: string }[];
    const players = (db().prepare(`SELECT COUNT(*) AS c FROM members WHERE company_id = ? AND role = 'player'`).get(c.id) as { c: number }).c;
    const plays = (db().prepare(`SELECT COUNT(*) AS c FROM attempts WHERE company_id = ?`).get(c.id) as { c: number }).c;
    try {
      await sendMail({
        fromName: FROM, replyTo: admins[0]?.email,
        subject: `【新人しごとシミュレーター】トライアル終了まで2日: ${c.name}`,
        text: [
          "トライアルがもうすぐ終わります。継続するかを伺ってください。",
          "",
          `会社: ${c.name}`,
          `終了: ${jstDate(c.trial_ends_at)}`,
          `人事: ${admins.map((a) => `${a.name}（${a.email}）`).join(" / ") || "-"}`,
          `電話: ${c.phone || "-"}`,
          `招待した人: ${players}人 / 記録: ${plays}回`,
          "",
          `運営画面（契約にする・7日延長）: ${SITE_URL}${BASE}/ops`,
        ].join("\n"),
      });
      db().prepare(`UPDATE companies SET end_notified_at = ? WHERE id = ?`).run(now(), c.id);
    } catch (e) {
      console.error("[shinjin] 終了前の知らせを送れませんでした:", e instanceof Error ? e.message : e);
    }
  }
}
