/**
 * /shinjin-sim/app の画面。サイト本体（黒地・ナビ付き）の枠に載せず、LP と同じ明るい単独の画面にするため、
 * React のレイアウトを通さずに HTML を直接返す。値はすべて esc() を通す。
 */

export const BASE = "/shinjin-sim/app";
/** メールに書くリンクの起点。Host ヘッダーから作らない（よそのドメインのリンクを送らされないため） */
export const SITE_URL = process.env.SITE_URL || "https://dataraw.jp";

export function esc(v: unknown): string {
  return String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

const CSS = `
:root{--paper:#f4f6f9;--card:#fff;--ink:#18212f;--sub:#556072;--line:#dde3ea;--navy:#1f3a68;--orange:#ee6a1b;--orange-dk:#c9520c;--star:#f2b300;--ng:#d6334a;--ok:#1f8a5b}
*{box-sizing:border-box}
body{margin:0;background:var(--paper);color:var(--ink);font-family:'Zen Kaku Gothic New','Hiragino Sans','BIZ UDPGothic','Meiryo',sans-serif;font-size:16px;line-height:1.7}
header{background:var(--navy);color:#fff}
header .in{max-width:1080px;margin:0 auto;padding:12px 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
header b{font-size:15px;letter-spacing:.04em}
header nav{display:flex;gap:14px;align-items:center;font-size:14px;flex-wrap:wrap}
header a,header button{color:#fff;background:none;border:0;font:inherit;cursor:pointer;padding:0;text-decoration:underline;text-underline-offset:3px}
main{max-width:1080px;margin:0 auto;padding:24px 16px 64px;display:grid;gap:20px}
h1{font-size:22px;margin:0;line-height:1.4;text-wrap:balance}
h2{font-size:17px;margin:0 0 10px}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:20px;min-width:0}
.narrow{max-width:460px;width:100%;margin:0 auto}
.sub{color:var(--sub);font-size:14px}
.note{color:var(--sub);font-size:13px;margin:6px 0 0}
form.stack{display:grid;gap:12px}
label{display:grid;gap:4px;font-size:14px;font-weight:700}
input,select{font:inherit;font-weight:400;padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:#fff;width:100%}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:end}
.row>label{flex:1 1 160px}
.btn{display:inline-block;background:var(--orange);color:#fff;border:0;border-radius:10px;padding:12px 20px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;text-align:center}
.btn:hover{background:var(--orange-dk)}
.btn.big{font-size:18px;padding:16px 24px;width:100%}
.btn.ghost{background:#fff;color:var(--navy);border:1px solid var(--line)}
.btn.small{padding:6px 12px;font-size:13px}
.msg{padding:12px 14px;border-radius:8px;background:#e8f4ee;color:var(--ok);font-size:14px}
.msg.ng{background:#fdecef;color:var(--ng)}
.scroll{overflow-x:auto}
table{border-collapse:collapse;width:100%;font-size:14px;font-variant-numeric:tabular-nums}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:left;white-space:nowrap;vertical-align:top}
th{font-size:12px;color:var(--sub);font-weight:700}
td.wrap{white-space:normal;min-width:220px}
.st{color:var(--star);letter-spacing:-1px}
.x{color:var(--ng);font-weight:700}
.dot{color:#c3cad4}
.tag{display:inline-block;font-size:12px;padding:1px 8px;border-radius:99px;background:#eef1f6;color:var(--sub)}
.tag.ng{background:#fdecef;color:var(--ng)}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}
.kpi b{display:block;font-size:26px;font-variant-numeric:tabular-nums}
details summary{cursor:pointer}
ol.path{margin:6px 0 0;padding-left:20px}
`;

export function page(title: string, body: string, opts: { nav?: string } = {}): Response {
  const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${esc(title)} | 新人しごとシミュレーター</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Zen+Kaku+Gothic+New:wght@400;700;900&display=swap">
<style>${CSS}</style></head><body>
<header><div class="in"><b>新人しごとシミュレーター 法人プラン</b><nav>${opts.nav ?? ""}</nav></div></header>
<main>${body}</main></body></html>`;
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

export function redirect(to: string): Response {
  return new Response(null, { status: 303, headers: { location: to, "cache-control": "no-store" } });
}

export function logoutForm(): string {
  return `<form method="post" action="${BASE}/logout" style="margin:0"><button type="submit">ログアウト</button></form>`;
}

export function stars(n: number): string {
  return `<span class="st" aria-label="★${n}">${"★".repeat(n)}${'<span class="dot">★</span>'.repeat(3 - n)}</span>`;
}

export function jst(iso: string | null): string {
  if (!iso) return "-";
  const d = new Date(new Date(iso).getTime() + 9 * 3600_000);
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}
