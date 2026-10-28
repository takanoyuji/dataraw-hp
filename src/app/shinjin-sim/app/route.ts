import { currentWho } from "@/lib/shinjin/auth";
import { attemptsOfMember } from "@/lib/shinjin/db";
import { BASE, esc, logoutForm, page, stars } from "@/lib/shinjin/html";
import { EPS, summarize } from "@/lib/shinjin/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MSG: Record<string, [string, boolean]> = {
  sent: ["登録があれば、ログイン用のリンクをメールで送りました。30分以内に開いてください。", false],
  expired: ["リンクの期限が切れているか、すでに使われています。もう一度メールアドレスを入れてください。", true],
  out: ["ログアウトしました。", false],
};

export async function GET(req: Request) {
  const who = await currentWho();
  const msg = MSG[new URL(req.url).searchParams.get("m") ?? ""];
  const msgHtml = msg ? `<p class="msg${msg[1] ? " ng" : ""}">${esc(msg[0])}</p>` : "";

  if (!who) {
    return page("ログイン", `
<section class="card narrow">
  <h1>ログイン</h1>
  <p class="sub">会社から招待されたメールアドレスを入れてください。ログイン用のリンクが届きます。</p>
  ${msgHtml}
  <form class="stack" method="post" action="${BASE}/login">
    <label>メールアドレス<input name="email" type="email" autocomplete="email" inputmode="email" required></label>
    <button class="btn" type="submit">ログイン用のリンクを送る</button>
  </form>
  <p class="note">※招待されていないアドレスには届きません<br>※法人プランの相談は <a href="/shinjin-sim">こちら</a></p>
</section>`);
  }

  const { member, company } = who;
  const s = summarize(attemptsOfMember(company.id, member.id));
  const cells = EPS.map((id) => {
    const e = s.eps[id];
    return `<td>${e.passed ? stars(e.stars) : e.plays ? '<span class="x">×</span>' : '<span class="dot">・</span>'}</td>`;
  }).join("");
  const nav = (member.role === "admin" ? `<a href="${BASE}/admin">管理画面</a>` : "") + logoutForm();
  return page("ホーム", `
${msgHtml}
<section class="card">
  <p class="sub">${esc(company.name)}</p>
  <h1>${esc(member.name)} さん</h1>
  <p class="sub">${s.nextNo ? `次は第${s.nextNo}話。70点以上で、次の話が開きます。` : "全10話クリア。何度でもやり直せます。"}</p>
  <a class="btn big" href="${BASE}/play">ゲームをはじめる</a>
  <p class="note">「モフ太の出世物語」（全10話）の結果が、会社の管理画面に残ります。ほかのモードは練習用で、記録されません。</p>
</section>
<section class="card">
  <h2>自分の進み具合</h2>
  <div class="scroll"><table><thead><tr>${EPS.map((_, i) => `<th>${i + 1}</th>`).join("")}<th>回数</th></tr></thead>
  <tbody><tr>${cells}<td>${s.plays}</td></tr></tbody></table></div>
</section>`, { nav });
}
