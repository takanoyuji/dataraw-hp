import { NextRequest, NextResponse } from "next/server";
import { hashIp } from "@/lib/comments";
import { addInquiry, countRecentInquiries, setMailStatus, type Inquiry } from "@/lib/contact";
import { offerSignup } from "@/lib/shinjin/signup";
import { sendMail, smtpConfigured } from "@/lib/smtp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 送り元は2つ。hp = トップのお問い合わせ、shinjin-sim = 新人しごとシミュレーター法人プランLP
const SIZES = ["5人まで", "6〜20人", "21〜50人", "51人以上"];

function str(v: unknown, max: number): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s && s.length <= max ? s : null;
}

function mailText(id: number, q: Inquiry, note?: string): string {
  const rows: [string, string | null][] = [
    ["会社名", q.company], ["お名前", q.name], ["メール", q.email], ["電話", q.phone],
    ["件名", q.subject], ["使いたい人数", q.size], ["内容", q.message],
  ];
  return [
    ...rows.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`),
    "",
    ...(note ? [note, ""] : []),
    `受付番号: ${id}（送り元: ${q.source}）`,
    "このメールに返信すると、お客様のアドレスに届きます。",
  ].join("\n");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // ハニーポット: ボットが隠しフィールドを埋めたら、成功を装って黙って破棄
    if (typeof body.website === "string" && body.website) {
      return NextResponse.json({ success: true });
    }

    const source = body.source === "shinjin-sim" ? "shinjin-sim" : "hp";
    const q: Inquiry = {
      source,
      name: str(body.name, 100) ?? "",
      company: str(body.company, 200) ?? "",
      email: str(body.email, 254) ?? "",
      phone: str(body.phone, 30),
      subject: str(body.subject, 200),
      message: str(body.message, 5000),
      size: SIZES.includes(body.size) ? body.size : null,
    };

    const missing = !q.name || !q.company || !q.email || (source === "hp" && (!q.subject || !q.message));
    if (missing || !/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(q.email)) {
      return NextResponse.json({ error: "必須項目が入力されていません" }, { status: 400 });
    }

    // レート制限: 同一IP（ハッシュ）から10分に3件まで。X-Real-IP は nginx が上書きする
    const ipHash = hashIp(request.headers.get("x-real-ip"));
    if (ipHash && countRecentInquiries(ipHash, 600) >= 3) {
      return NextResponse.json({ error: "送信が多すぎます。少し時間をおいてお試しください" }, { status: 429 });
    }

    const id = addInquiry({ ...q, ipHash });

    // 新人しごとシミュレーターの古い相談フォーム（2026-10-29 に申し込み制へ変える前のページ）から来た分は、
    // 申込者に確認リンクを送り、リンク先で登録まで済ませてもらう
    const note = source === "shinjin-sim"
      ? `→ ${await offerSignup(q, request.headers.get("x-real-ip") ?? "local")}`
      : undefined;

    if (!smtpConfigured()) {
      console.error(`[contact] #${id} を保存したが、SMTP の環境変数が無くメールを送れない`);
      setMailStatus(id, "not_configured");
    } else {
      const subject = source === "shinjin-sim"
        ? `[新人しごとシミュレーター] 旧フォームからの申し込み ${q.company}`
        : `[dataraw.jp お問い合わせ] ${q.subject} / ${q.company}`;
      try {
        await sendMail({ subject, text: mailText(id, q, note), replyTo: q.email });
        setMailStatus(id, "sent");
      } catch (e) {
        console.error(`[contact] #${id} のメール送信に失敗:`, e instanceof Error ? e.message : e);
        setMailStatus(id, "failed");
      }
    }

    // 保存できていれば受付は成功。メールの成否は mail_status に残す
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
