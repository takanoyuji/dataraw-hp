import { verifyAdmin } from "@/lib/admin-auth";
import { listCompanies, listMembers } from "@/lib/shinjin/db";
import { BASE, esc, jst, page, redirect } from "@/lib/shinjin/html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MSG: Record<string, [string, boolean]> = {
  created: ["会社を作り、人事の方に招待メールを送りました。", false],
  mailfail: ["会社は作りましたが、招待メールを送れませんでした。サーバーのログを確かめてください。", true],
  dup: ["そのメールアドレスは、すでにどこかの会社に登録されています。", true],
  bad: ["入力を確かめてください。", true],
  done: ["変えました。", false],
};

/** 運営（データロー）の画面。dataraw.jp の管理画面と同じログイン（ADMIN_PASSWORD）で入る */
export async function GET(req: Request) {
  if (!(await verifyAdmin())) return redirect("/admin/login");
  const msg = MSG[new URL(req.url).searchParams.get("m") ?? ""];
  const rows = listCompanies().map((c) => {
    const admins = listMembers(c.id).filter((m) => m.role === "admin").map((m) => `${esc(m.name)}（${esc(m.email)}）`).join("<br>");
    return `<tr><td>${c.id}</td><td>${esc(c.name)}${c.status !== "active" ? ' <span class="tag ng">停止</span>' : ""}<br><span class="sub">${c.source === "self" ? "LPから申込" : "運営が作成"} ${jst(c.created_at)}</span></td>
<td>${c.plan === "trial" ? `トライアル<br><span class="sub">${jst(c.trial_ends_at)} まで</span>` : "契約"}</td><td>${c.seat_limit}人</td><td>${c.members}人</td><td>${c.attempts}回</td><td class="wrap">${admins}${c.phone ? `<br><span class="sub">電話 ${esc(c.phone)}</span>` : ""}</td>
<td><form method="post" action="${BASE}/ops/companies" class="row" style="gap:6px"><input type="hidden" name="id" value="${c.id}">
${c.status === "active" ? '<button class="btn ghost small" name="action" value="stop">停止する</button>' : '<button class="btn ghost small" name="action" value="start">再開</button>'}
${c.plan === "trial" ? '<button class="btn ghost small" name="action" value="paid">契約にする</button><button class="btn ghost small" name="action" value="extend">7日延長</button>' : ""}
<label style="flex:0 0 90px">人数<input name="seats" type="number" min="1" max="500" value="${c.seat_limit}"></label><button class="btn ghost small" name="action" value="seats">人数を変える</button>
</form></td></tr>`;
  }).join("");
  return page("運営", `
${msg ? `<p class="msg${msg[1] ? " ng" : ""}">${esc(msg[0])}</p>` : ""}
<section><h1>運営: 会社の一覧</h1><p class="sub">LP から申し込むと、メール確認のあと自動でここに並びます（5人・2週間）。終了の2日前に通知メールが届きます。人事担当が自分で社員を招待します。</p></section>
<section class="card"><div class="scroll"><table><thead><tr><th>#</th><th>会社</th><th>プラン</th><th>上限</th><th>登録</th><th>記録</th><th>人事</th><th></th></tr></thead>
<tbody>${rows || '<tr><td colspan="8" class="sub">まだありません</td></tr>'}</tbody></table></div></section>
<section class="card"><h2>会社を作って、人事の方を招待する</h2>
<form class="stack" method="post" action="${BASE}/ops/companies"><input type="hidden" name="action" value="create">
  <div class="row">
    <label>会社名<input name="company" required maxlength="100"></label>
    <label>人事の方のお名前<input name="name" required maxlength="50"></label>
    <label>人事の方のメール<input name="email" type="email" required></label>
  </div>
  <div class="row">
    <label>トライアル日数<input name="days" type="number" min="1" max="365" value="14"></label>
    <label>受講者の上限<input name="seats" type="number" min="1" max="500" value="5"></label>
  </div>
  <div><button class="btn" type="submit">作って招待メールを送る</button></div>
</form></section>`, { nav: `<a href="/admin">dataraw.jp 管理画面</a>` });
}
