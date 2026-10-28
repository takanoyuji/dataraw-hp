import { sendMail } from "@/lib/smtp";
import { issueToken, INVITE_HOURS, LOGIN_MINUTES } from "./auth";
import { markInvited, type Company, type Member } from "./db";
import { BASE, SITE_URL } from "./html";

const FROM = "新人しごとシミュレーター";

/** 招待メール。リンクは7日間・1回だけ使える */
export async function sendInvite(m: Member, c: Company, by: string): Promise<void> {
  const link = `${SITE_URL}${BASE}/auth?t=${issueToken(m.id, "invite")}`;
  const role = m.role === "admin" ? "管理画面（全員の進み具合と記録）と、ゲーム" : "研修ゲーム「新人しごとシミュレーター」";
  await sendMail({
    to: m.email, fromName: FROM,
    subject: `【${c.name}】新人しごとシミュレーターへの招待`,
    text: [
      `${m.name} さん`,
      "",
      `${by} から、${role}への招待が届いています。`,
      "下のリンクを開き、「はじめる」を押すとログインできます。パスワードはありません。",
      "",
      link,
      "",
      `※リンクの有効期限は${INVITE_HOURS / 24}日間、1回だけ使えます。`,
      `※期限が切れたら ${SITE_URL}${BASE} でメールアドレスを入れると、ログイン用のリンクが届きます。`,
      "",
      "1話5分。スマホでもパソコンでも遊べます。",
      "",
      "--",
      "新人しごとシミュレーター（運営: 合同会社データロー）",
      `${SITE_URL}/shinjin-sim`,
    ].join("\n"),
  });
  markInvited(m.id);
}

/** ログイン用のリンク。30分・1回だけ */
export async function sendLoginLink(m: Member): Promise<void> {
  const link = `${SITE_URL}${BASE}/auth?t=${issueToken(m.id, "login")}`;
  await sendMail({
    to: m.email, fromName: FROM,
    subject: "新人しごとシミュレーターのログイン",
    text: [
      `${m.name} さん`,
      "",
      "下のリンクを開き、「はじめる」を押すとログインできます。",
      "",
      link,
      "",
      `※有効期限は${LOGIN_MINUTES}分、1回だけ使えます。`,
      "※心当たりがなければ、このメールは捨ててください。",
      "",
      "--",
      "新人しごとシミュレーター（運営: 合同会社データロー）",
    ].join("\n"),
  });
}
