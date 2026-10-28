import type { Attempt } from "./db";

/** 共通の10話（モフ太の出世物語）。ゲームの MX_ORDER と同じ並び */
export const EPS = ["mx1", "mx2", "mx3", "mx4", "mx5", "mx6", "mx7", "mx8", "mx9", "mx10"];
/** 次の話が開く点数（ゲームの MON_PASS と同じ） */
export const PASS = 70;

export interface EpStat { best: number; stars: number; plays: number; passed: boolean }
export interface Summary { eps: Record<string, EpStat>; plays: number; cleared: number; nextNo: number | null; last: string | null }

export function summarize(rows: Attempt[]): Summary {
  const eps: Record<string, EpStat> = {};
  for (const id of EPS) eps[id] = { best: 0, stars: 0, plays: 0, passed: false };
  let last: string | null = null;
  for (const a of rows) {
    const e = eps[a.ep];
    if (!e) continue;
    e.plays++;
    e.best = Math.max(e.best, a.pts);
    e.stars = Math.max(e.stars, a.stars);
    if (a.pts >= PASS) e.passed = true;
    if (!last || a.created_at > last) last = a.created_at;
  }
  const plays = EPS.reduce((n, id) => n + eps[id].plays, 0);
  const firstOpen = EPS.findIndex((id) => !eps[id].passed);
  return { eps, plays, cleared: EPS.filter((id) => eps[id].passed).length, nextNo: firstOpen < 0 ? null : firstOpen + 1, last };
}

/** ゲームに返す最高点。ゲームはこれで「次の話が開いているか」を決める */
export function progressForGame(rows: Attempt[]): { pts: Record<string, number>; stars: Record<string, number> } {
  const s = summarize(rows), pts: Record<string, number> = {}, stars: Record<string, number> = {};
  for (const id of EPS) if (s.eps[id].plays) { pts[id] = s.eps[id].best; stars[id] = s.eps[id].stars; }
  return { pts, stars };
}

function parseMinus(a: Attempt): { pt: number; why: string }[] {
  try {
    const v = JSON.parse(a.minus);
    return Array.isArray(v) ? v.filter((m) => m && typeof m.why === "string") : [];
  } catch { return []; }
}

/** 1人の、つまずいた場面（減点の理由）の多い順 */
export function missesOfMember(rows: Attempt[]): { no: number; why: string; times: number }[] {
  const m = new Map<string, { no: number; why: string; times: number }>();
  for (const a of rows) {
    for (const x of parseMinus(a)) {
      const k = a.ep + "|" + x.why;
      const cur = m.get(k) ?? { no: a.no, why: x.why, times: 0 };
      cur.times++;
      m.set(k, cur);
    }
    if (a.down) {
      const k = a.ep + "|down";
      const cur = m.get(k) ?? { no: a.no, why: "体力が0になって、たおれた", times: 0 };
      cur.times++;
      m.set(k, cur);
    }
  }
  return [...m.values()].sort((x, y) => y.times - x.times || x.no - y.no);
}

/** 会社全体で、つまずいた人の割合が高い場面。分母はその話を遊んだ人数 */
export function missesOfCompany(rows: Attempt[]): { no: number; why: string; people: number; of: number }[] {
  const played = new Map<string, Set<number>>(), hit = new Map<string, { no: number; why: string; ep: string; who: Set<number> }>();
  for (const a of rows) {
    if (!played.has(a.ep)) played.set(a.ep, new Set());
    played.get(a.ep)!.add(a.member_id);
    for (const x of parseMinus(a)) {
      const k = a.ep + "|" + x.why;
      if (!hit.has(k)) hit.set(k, { no: a.no, why: x.why, ep: a.ep, who: new Set() });
      hit.get(k)!.who.add(a.member_id);
    }
  }
  return [...hit.values()]
    .map((h) => ({ no: h.no, why: h.why, people: h.who.size, of: played.get(h.ep)!.size }))
    .sort((x, y) => y.people / y.of - x.people / x.of || y.people - x.people || x.no - y.no);
}
