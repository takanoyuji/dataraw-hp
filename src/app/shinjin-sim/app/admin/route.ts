import { currentWho } from "@/lib/shinjin/auth";
import { attemptsOfCompany, countActivePlayers, listMembers, type Attempt } from "@/lib/shinjin/db";
import { BASE, esc, jst, logoutForm, page, redirect, stars } from "@/lib/shinjin/html";
import { EPS, missesOfCompany, summarize } from "@/lib/shinjin/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MSG: Record<string, [string, boolean]> = {
  added: ["登録して、招待メールを送りました。", false],
  mailfail: ["登録しましたが、招待メールを送れませんでした。「招待を送り直す」を押してください。", true],
  dup: ["そのメールアドレスは、すでに登録されています。", true],
  full: ["人数の上限に達しています。止めた人を外すか、運営に人数の追加をご相談ください。", true],
  bad: ["入力を確かめてください（メールアドレスとお名前は必須）。", true],
  resent: ["招待メールを送り直しました。", false],
  stopped: ["止めました。この人はログインできなくなり、記録は残ります。", false],
  started: ["再開しました。", false],
  self: ["自分自身は止められません。", true],
  welcome: ["無料トライアルが始まりました（5人・2週間）。下の「人を招待する」から、新人の方を招待してください。招待した方にはメールでログイン用のリンクが届きます。", false],
};

export async function GET(req: Request) {
  const who = await currentWho();
  if (!who) return redirect(BASE);
  if (who.member.role !== "admin") return redirect(BASE);
  const { company, member: me } = who;

  const members = listMembers(company.id);
  const all = attemptsOfCompany(company.id);
  const byMember = new Map<number, Attempt[]>();
  for (const a of all) { if (!byMember.has(a.member_id)) byMember.set(a.member_id, []); byMember.get(a.member_id)!.push(a); }

  const players = members.filter((m) => m.role === "player" || byMember.has(m.id));
  const rows = players.map((m) => {
    const s = summarize(byMember.get(m.id) ?? []);
    const prog = s.plays === 0 ? '<span class="tag">未着手</span>' : s.nextNo ? `第${s.nextNo}話` : '<span class="tag">修了</span>';
    const cells = EPS.map((id) => {
      const e = s.eps[id];
      return `<td>${e.passed ? stars(e.stars) : e.plays ? '<span class="x">×</span>' : '<span class="dot">・</span>'}</td>`;
    }).join("");
    return { m, s, html: `<tr><td><a href="${BASE}/admin/m/${m.id}">${esc(m.name)}</a>${m.status !== "active" ? ' <span class="tag ng">停止</span>' : ""}<br><span class="sub">${esc(m.dept)}</span></td><td>${prog}</td>${cells}<td>${s.plays}</td><td>${jst(s.last)}</td></tr>` };
  });

  const started = rows.filter((r) => r.s.plays > 0).length;
  const done = rows.filter((r) => r.s.cleared === EPS.length).length;
  const misses = missesOfCompany(all).slice(0, 8);
  const msg = MSG[new URL(req.url).searchParams.get("m") ?? ""];
  const trial = company.plan === "trial" && company.trial_ends_at ? `トライアル: ${jst(company.trial_ends_at)} まで` : "";

  const manage = members.map((m) => `<tr>
    <td>${esc(m.name)}${m.id === me.id ? '（自分）' : ""}<br><span class="sub">${esc(m.email)}</span></td>
    <td>${esc(m.dept) || "-"}</td>
    <td>${m.role === "admin" ? "人事（管理画面）" : "遊ぶ人"}</td>
    <td>${m.status === "active" ? (m.last_login_at ? `ログイン ${jst(m.last_login_at)}` : `招待 ${jst(m.invited_at)}`) : '<span class="tag ng">停止</span>'}</td>
    <td><form method="post" action="${BASE}/admin/members/action" class="row" style="gap:6px">
      <input type="hidden" name="id" value="${m.id}">
      ${m.status === "active" && !m.last_login_at ? '<button class="btn ghost small" name="action" value="resend">招待を送り直す</button>' : ""}
      ${m.id === me.id ? "" : m.status === "active" ? '<button class="btn ghost small" name="action" value="stop">止める</button>' : '<button class="btn ghost small" name="action" value="start">再開する</button>'}
    </form></td></tr>`).join("");

  return page("管理画面", `
${msg ? `<p class="msg${msg[1] ? " ng" : ""}">${esc(msg[0])}</p>` : ""}
<section>
  <p class="sub">${esc(company.name)}　${esc(trial)}</p>
  <h1>誰が、どこで詰まったか</h1>
</section>
<section class="kpis">
  <div class="card kpi"><span class="sub">遊ぶ人</span><b>${countActivePlayers(company.id)} / ${company.seat_limit}人</b></div>
  <div class="card kpi"><span class="sub">遊び始めた人</span><b>${started}人</b></div>
  <div class="card kpi"><span class="sub">全10話クリア</span><b>${done}人</b></div>
  <div class="card kpi"><span class="sub">遊んだ回数（やり直し込み）</span><b>${all.length}回</b></div>
</section>
<section class="card">
  <h2>全員の進み具合</h2>
  <p class="note">★=70点以上でクリアした話（最高の★）/ ×=遊んだがまだ70点に届いていない / ・=まだ。名前を押すと、1人ずつの記録が見られます</p>
  <div class="scroll"><table><thead><tr><th>名前</th><th>進み</th>${EPS.map((_, i) => `<th>${i + 1}</th>`).join("")}<th>回数</th><th>最後</th></tr></thead>
  <tbody>${rows.map((r) => r.html).join("") || `<tr><td colspan="14" class="sub">まだ誰も登録されていません。下の「人を招待する」から登録してください。</td></tr>`}</tbody></table></div>
</section>
<section class="card">
  <h2>つまずいた人が多い場面</h2>
  ${misses.length ? `<div class="scroll"><table><thead><tr><th>話</th><th>場面</th><th>つまずいた人</th></tr></thead><tbody>${misses.map((x) =>
    `<tr><td>第${x.no}話</td><td class="wrap">${esc(x.why)}</td><td>${Math.round((x.people / x.of) * 100)}%（${x.people}/${x.of}人）</td></tr>`).join("")}</tbody></table></div>
  <p class="note">分母は、その話を遊んだ人数。1回でもその場面で減点された人を数えます</p>` : '<p class="sub">まだ記録がありません。</p>'}
</section>
<section class="card">
  <h2>人を招待する</h2>
  <form class="stack" method="post" action="${BASE}/admin/members">
    <div class="row">
      <label>メールアドレス<input name="email" type="email" autocomplete="off" required></label>
      <label>お名前<input name="name" required maxlength="50"></label>
      <label>部署<input name="dept" maxlength="50" placeholder="例: 営業1課"></label>
      <label>役割<select name="role"><option value="player">遊ぶ人</option><option value="admin">人事（管理画面も見る）</option></select></label>
    </div>
    <div><button class="btn" type="submit">登録して招待メールを送る</button></div>
  </form>
  <p class="note">※招待メールのリンクは7日間有効<br>※遊ぶ人の上限は ${company.seat_limit}人。人事は数えません</p>
</section>
<section class="card">
  <h2>登録している人</h2>
  <div class="scroll"><table><thead><tr><th>名前</th><th>部署</th><th>役割</th><th>状態</th><th></th></tr></thead><tbody>${manage}</tbody></table></div>
  <p class="note">※止めた人はログインできなくなります。記録は消えません</p>
</section>
<section class="card">
  <h2>点数の扱い</h2>
  <p class="sub">点数は、本人の端末で計算して送られます。研修の目安として使い、人事評価には使わないでください。</p>
</section>`, { nav: `<a href="${BASE}/play">ゲーム</a>${logoutForm()}` });
}
