import { sendMail } from "@/lib/smtp";
import { issueToken, INVITE_HOURS, LOGIN_MINUTES } from "./auth";
import { markInvited, type Company, type Member } from "./db";
import { BASE, SITE_URL } from "./html";

const FROM = "新人しごとシミュレーター";

/** 招待メール。リンクは7日間・1回だけ使える */
export async function sendInvite(m: Member, c: Company, by: string): Promise<void> {
  const link = `${SITE_URL}${BASE}/auth?t=${issueToken(m.id, "invite")}`;
  const role = m.role === "admin" ? "管理画面（受講者の進捗と記録）と研修ゲーム" : "研修ゲーム「新人しごとシミュレーター」";
  await sendMail({
    to: m.email, fromName: FROM,
    subject: `【${c.name}】新人しごとシミュレーターへの招待`,
    text: [
      `${m.name} さん`,
      "",
      `${by} から、${role}への招待が届いています。`,
      "下のリンクを開き、「ログインする」を押してください。パスワードは不要です。",
      "",
      link,
      "",
      `※リンクの有効期限は${INVITE_HOURS / 24}日間、1回だけ使えます。`,
      `※期限が切れたら ${SITE_URL}${BASE} でメールアドレスを入れると、ログイン用のリンクが届きます。`,
      "",
      "1話5分ほどで、スマホでもパソコンでも利用できます。",
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
      "下のリンクを開き、「ログインする」を押してください。",
      "",
      link,
      "",
      `※有効期限は${LOGIN_MINUTES}分、1回だけ使えます。`,
      "※お心当たりがない場合は、このメールを破棄してください。",
      "",
      "--",
      "新人しごとシミュレーター（運営: 合同会社データロー）",
    ].join("\n"),
  });
}
