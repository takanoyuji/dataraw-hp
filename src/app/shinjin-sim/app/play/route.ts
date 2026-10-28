import fs from "fs";
import path from "path";
import crypto from "crypto";
import { currentWho } from "@/lib/shinjin/auth";
import { attemptsOfMember } from "@/lib/shinjin/db";
import { BASE, redirect } from "@/lib/shinjin/html";
import { progressForGame } from "@/lib/shinjin/progress";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * ログインした人にだけゲームを返す。ゲームは public/ でなく private/ に置く（URLを知っていても開けない）。
 * 返す前に、本人の最高点をブラウザに入れる起動スクリプトと、結果をサーバーへ送る SIM_HOOK を差し込む。
 */
let cache: { html: string; ver: string } | null = null;
function game() {
  if (cache) return cache;
  const html = fs.readFileSync(path.join(process.cwd(), "private/shinjin-sim/game.html"), "utf8");
  cache = { html, ver: crypto.createHash("sha256").update(html).digest("hex").slice(0, 10) };
  return cache;
}

const json = (v: unknown) => JSON.stringify(v).replace(/</g, "\\u003c");

export async function GET() {
  const who = await currentWho();
  if (!who) return redirect(BASE);
  const g = game();
  const prog = progressForGame(attemptsOfMember(who.company.id, who.member.id));
  const boot = `<style>.pro{display:none!important}</style>
<script>
(function(){
  var U=${json(String(who.member.id))}, P=${json(prog.pts)}, S=${json(prog.stars)}, V=${json(g.ver)}, API=${json(BASE + "/api/attempts")}, QK='bizSim.app.queue';
  var ls; try { ls = window.localStorage; } catch (e) {}
  function rd(k){ try { return JSON.parse(ls.getItem(k) || 'null'); } catch (e) { return null; } }
  function wr(k, v){ try { ls.setItem(k, JSON.stringify(v)); } catch (e) {} }
  try {
    // 共用の端末で、前の人の進み具合や送れていない記録が混ざらないよう、人が替わったら消す
    if (ls.getItem('bizSim.app.user') !== U) {
      Object.keys(ls).filter(function(k){ return k.indexOf('bizSim.') === 0; }).forEach(function(k){ ls.removeItem(k); });
      ls.setItem('bizSim.app.user', U);
    }
    var mp = rd('bizSim.mon.pts.v1') || {}, ep = rd('bizSim.ep.v1') || {}, k;
    for (k in P) mp[k] = Math.max(mp[k] || 0, P[k]);
    for (k in S) ep[k] = Math.max(ep[k] || 0, S[k]);
    wr('bizSim.mon.pts.v1', mp); wr('bizSim.ep.v1', ep);
  } catch (e) {}
  var busy = false;
  function flush(){
    var q = rd(QK) || [];
    if (busy || !q.length) return;
    busy = true;
    fetch(API, {method:'POST', headers:{'content-type':'application/json'}, credentials:'same-origin', body:JSON.stringify(q[0])})
      .then(function(r){
        busy = false;
        // 送れた・形が正しくない（送り直しても通らない）ときは列から外す。ログインが切れたら残しておく
        if (r.ok || r.status === 400) { wr(QK, (rd(QK) || []).slice(1)); flush(); }
      })
      .catch(function(){ busy = false; });
  }
  window.SIM_HOOK = { result: function(r){
    if (r.kind !== 'monx') return;  // 記録するのは共通の10話（モフ太の出世物語）だけ
    r.v = V;
    var q = rd(QK) || []; q.push(r); wr(QK, q.slice(-50)); flush();
  }};
  window.addEventListener('load', flush);
  window.addEventListener('online', flush);
})();
</script>`;
  const html = g.html.replace("<head>", "<head>\n" + boot);
  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}
