import { currentWho } from "@/lib/shinjin/auth";
import { attemptsOfMember, getMemberInCompany } from "@/lib/shinjin/db";
import { BASE, esc, jst, logoutForm, page, redirect, stars } from "@/lib/shinjin/html";
import { EPS, missesOfMember, summarize } from "@/lib/shinjin/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parse<T>(s: string): T[] {
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : []; } catch { return []; }
}

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const who = await currentWho();
  if (!who) return redirect(BASE);
  if (who.member.role !== "admin") return redirect(BASE);
  // ほかの会社の人の番号を入れても、見つからない扱いにする
  const m = getMemberInCompany(who.company.id, Number((await ctx.params).id));
  if (!m) return page("見つかりません", `<section class="card"><h1>見つかりません</h1><p><a href="${BASE}/admin">管理画面に戻る</a></p></section>`);

  const rows = attemptsOfMember(who.company.id, m.id);
  const s = summarize(rows);
  const titles = new Map(rows.map((a) => [a.ep, a.title]));
  const misses = missesOfMember(rows).slice(0, 10);

  const eps = EPS.map((id, i) => {
    const e = s.eps[id];
    return `<tr><td>第${i + 1}話</td><td class="wrap">${esc(titles.get(id) ?? "")}</td><td>${e.plays ? (e.passed ? stars(e.stars) : '<span class="x">×</span>') : '<span class="dot">・</span>'}</td><td>${e.plays ? e.best + "点" : "-"}</td><td>${e.plays}</td></tr>`;
  }).join("");

  const log = rows.map((a) => {
    const minus = parse<{ pt: number; why: string }>(a.minus);
    const path = parse<{ text: string; note: string }>(a.path);
    return `<tr><td>${jst(a.created_at)}</td><td>第${a.no}話</td><td>${a.pts}点 ${stars(a.stars)}${a.down ? ' <span class="tag ng">たおれた</span>' : ""}</td>
<td class="wrap"><details><summary>${minus.length ? `減点 ${minus.length}か所` : "減点なし"} / 選んだ答え ${path.length}</summary>
${minus.length ? `<ul>${minus.map((x) => `<li>−${x.pt}点 ${esc(x.why)}</li>`).join("")}</ul>` : ""}
<ol class="path">${path.map((p) => `<li>${esc(p.text)}<br><span class="sub">${esc(p.note)}</span></li>`).join("")}</ol></details></td></tr>`;
  }).join("");

  return page(m.name, `
<section>
  <p class="sub"><a href="${BASE}/admin">← 全員の進み具合</a></p>
  <h1>${esc(m.name)} さん</h1>
  <p class="sub">${esc(m.dept)}　${s.plays === 0 ? "未着手" : s.nextNo ? `第${s.nextNo}話まで進行中` : "全10話クリア"}　遊んだ回数 ${s.plays}回　最後 ${jst(s.last)}</p>
</section>
<section class="card">
  <h2>つまずいた場面（多い順）</h2>
  ${misses.length ? `<div class="scroll"><table><thead><tr><th>話</th><th>場面</th><th>回数</th></tr></thead><tbody>${misses.map((x) =>
    `<tr><td>第${x.no}話</td><td class="wrap">${esc(x.why)}</td><td>×${x.times}</td></tr>`).join("")}</tbody></table></div>` : '<p class="sub">まだありません。</p>'}
</section>
<section class="card">
  <h2>話ごと</h2>
  <div class="scroll"><table><thead><tr><th>話</th><th>題</th><th>★</th><th>最高点</th><th>回数</th></tr></thead><tbody>${eps}</tbody></table></div>
</section>
<section class="card">
  <h2>すべての記録（やり直しを含む・新しい順）</h2>
  ${rows.length ? `<div class="scroll"><table><thead><tr><th>日時</th><th>話</th><th>結果</th><th>中身</th></tr></thead><tbody>${log}</tbody></table></div>` : '<p class="sub">まだありません。</p>'}
</section>`, { nav: `<a href="${BASE}/admin">管理画面</a>${logoutForm()}` });
}
