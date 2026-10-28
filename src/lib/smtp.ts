import tls from "tls";

/**
 * 通知メールの送信（Gmail / Google Workspace の SMTP に TLS で直接つなぐ）。
 * - 2026-10-28: nodemailer は脆弱性の無い版がどれも公開2週間未満だったため、依存を足さずに書いた。
 * - 宛先・差出人は環境変数で固定。フォームの入力は本文と Reply-To にしか入れない（宛先は変えられない）。
 * - 環境変数: SMTP_USER（差出人。takano@dataraw.jp）/ SMTP_PASS（アプリパスワード）/ CONTACT_TO（通知先）
 */

const HOST = "smtp.gmail.com";
const PORT = 465;

export function smtpConfigured(): boolean {
  return !!(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.CONTACT_TO);
}

/** ヘッダーに入れる値から改行を除く（ヘッダー注入を防ぐ） */
function oneLine(s: string): string {
  return s.replace(/[\r\n]+/g, " ").trim();
}

function encodeHeader(s: string): string {
  return `=?UTF-8?B?${Buffer.from(oneLine(s), "utf8").toString("base64")}?=`;
}

function wrap76(b64: string): string {
  return b64.replace(/.{1,76}/g, "$&\r\n");
}

export async function sendMail(input: { subject: string; text: string; replyTo?: string }): Promise<void> {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.CONTACT_TO;
  if (!user || !pass || !to) throw new Error("SMTP_USER / SMTP_PASS / CONTACT_TO が未設定");

  const replyTo = input.replyTo && /^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(input.replyTo) ? input.replyTo : null;
  const headers = [
    `From: ${encodeHeader("dataraw.jp フォーム")} <${user}>`,
    `To: <${to}>`,
    ...(replyTo ? [`Reply-To: <${replyTo}>`] : []),
    `Subject: ${encodeHeader(input.subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${Date.now()}.${Math.random().toString(36).slice(2)}@dataraw.jp>`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: base64",
  ];
  const data = headers.join("\r\n") + "\r\n\r\n" + wrap76(Buffer.from(input.text, "utf8").toString("base64"));

  const auth = Buffer.from(`\0${user}\0${pass}`, "utf8").toString("base64");
  // [送るコマンド, 期待する応答コード]
  const steps: [string | null, number][] = [
    [null, 220],
    ["EHLO dataraw.jp", 250],
    [`AUTH PLAIN ${auth}`, 235],
    [`MAIL FROM:<${user}>`, 250],
    [`RCPT TO:<${to}>`, 250],
    ["DATA", 354],
    [data + ".\r\n", 250],
    ["QUIT", 221],
  ];

  await new Promise<void>((resolve, reject) => {
    const sock = tls.connect({ host: HOST, port: PORT, servername: HOST });
    let buf = "";
    let i = 0;
    const fail = (e: Error) => { sock.destroy(); reject(e); };
    sock.setTimeout(15000, () => fail(new Error("SMTP タイムアウト")));
    sock.on("error", fail);
    sock.on("data", (chunk) => {
      buf += chunk.toString("utf8");
      // 複数行の応答は最終行が "250 " のように空白で終わる
      const lines = buf.split("\r\n").filter(Boolean);
      const last = lines[lines.length - 1];
      if (!buf.endsWith("\r\n") || !/^\d{3} /.test(last)) return;
      const code = Number(last.slice(0, 3));
      buf = "";
      const [, expect] = steps[i];
      if (code !== expect) {
        // AUTH の行を含めないよう、応答だけ返す
        return fail(new Error(`SMTP 応答 ${code}（手順${i}）: ${oneLine(last).slice(0, 200)}`));
      }
      i++;
      if (i >= steps.length) { sock.end(); return resolve(); }
      const [cmd] = steps[i];
      sock.write(cmd!.endsWith("\r\n") ? cmd! : cmd + "\r\n");
    });
  });
}
