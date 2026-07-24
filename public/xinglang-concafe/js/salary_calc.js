// salary_calc.js - 給与計算ロジック（salary.py の JavaScript移植）
'use strict';

// ========== CSV パース ==========

function parseCSV(text) {
  const rows  = [];
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  if (!lines.length) return rows;
  const header = parseLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cells = parseLine(lines[i]);
    const row   = {};
    header.forEach((col, j) => { row[col] = cells[j] !== undefined ? cells[j] : ''; });
    rows.push(row);
  }
  return rows;
}

function parseLine(line) {
  const cells = [];
  let inQ = false, cell = '';
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"' && line[i+1] === '"') { cell += '"'; i++; }
      else if (c === '"') { inQ = false; }
      else { cell += c; }
    } else {
      if (c === '"')      { inQ = true; }
      else if (c === ',') { cells.push(cell); cell = ''; }
      else { cell += c; }
    }
  }
  cells.push(cell);
  return cells;
}

function parseShiftJisCSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => { const dec = new TextDecoder('shift-jis'); resolve(parseCSV(dec.decode(e.target.result))); };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

function parseUtf8CSV(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(parseCSV(e.target.result));
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

// ========== デフォルトランク ==========

function getDefaultRanks() {
  return [
    { ランク: '店長',   時給: 1500, バック率: 0.50 },
    { ランク: 'プラチナ', 時給: 1400, バック率: 0.50 },
    { ランク: 'ブラック', 時給: 1300, バック率: 0.40 },
    { ランク: 'ゴールド', 時給: 1200, バック率: 0.35 },
    { ランク: 'シルバー', 時給: 1200, バック率: 0.30 },
    { ランク: '内勤',   時給: 0,    バック率: 0.30 },
    { ランク: 'ブロンズ', 時給: 1100, バック率: 0.25 },
    { ランク: '研修',   時給: 1100, バック率: 0.20 },
  ];
}

// ========== 給与計算メイン ==========

function calculateSalary(salesRows, wageRows, rankRows, castRows, store) {
  // 店舗フィルタ（統合キャストCSVの場合）
  if (store && castRows.length > 0 && '店舗' in castRows[0]) {
    castRows = castRows.filter(r => r['店舗'] === store);
  }

  // --- 売上データ処理 ---
  const sales = salesRows.map(r => {
    const origCat  = r['カテゴリー'] || '';
    const isRemote = origCat.startsWith('遠隔_');
    const category = origCat.replace(/^遠隔_/, '');
    let gp = parseFloat(r['粗利総額'])   || 0;
    let ts = parseFloat(r['販売総売上']) || 0;
    if (r['税区分'] === '内税') gp = gp - ts * 0.1;
    return {
      商品名:     r['商品名'] || '',
      カテゴリー: category,
      isRemote,
      税区分:     r['税区分'] || '',
      販売総売上: ts,
      粗利総額:   gp,
      販売商品数: parseFloat(r['販売商品数']) || 0,
    };
  });

  // キャスト別粗利・売上集計
  const gpBC = {}, suBC = {};
  for (const s of sales) {
    if (!s.カテゴリー) continue;
    gpBC[s.カテゴリー] = (gpBC[s.カテゴリー] || 0) + s.粗利総額;
    suBC[s.カテゴリー] = (suBC[s.カテゴリー] || 0) + s.販売総売上;
  }

  // --- 人件費データ処理 ---
  const wBP = {};
  for (const w of wageRows) {
    const n = w['氏名']; if (!n) continue;
    const b = parseFloat(w['基本給'])   || 0;
    const c = parseFloat(w['通勤手当']) || 0;
    if (!wBP[n]) wBP[n] = { 基本給: 0, 通勤手当: 0, 時給計: 0 };
    wBP[n].基本給   += b;
    wBP[n].通勤手当 += c;
    wBP[n].時給計   += b + c;
  }

  // --- ランクマップ ---
  const rm = {};
  for (const r of rankRows) rm[r['ランク']] = { 時給: parseFloat(r['時給']) || 0, バック率: parseFloat(r['バック率']) || 0 };

  // --- キャスト一覧生成 ---
  const castList = castRows.map(c => {
    const cn = c['キャスト名'] || '', as = c['Airシフト'] || '', rk = c['ランク'] || '';
    const ri = rm[rk] || { 時給: 0, バック率: 0 };
    const w  = wBP[as] || { 基本給: 0, 通勤手当: 0, 時給計: 0 };
    return {
      キャスト名: cn, Airシフト: as, ランク: rk,
      時給: ri.時給, バック率: ri.バック率,
      基本給: w.基本給, 通勤手当: w.通勤手当, 時給計: w.時給計,
      粗利総額: gpBC[cn] || 0, 販売総売上: suBC[cn] || 0,
      退職: c['退職'] === 'true' || c['退職'] === true || c['退職'] === '1',
    };
  });

  // --- 給与計算 ---
  for (const c of castList) {
    if (['店長', 'プラチナ', 'ブラック', 'ゴールド'].includes(c.ランク) && c.キャスト名 !== 'おかた') {
      c.通勤手当 = 0;
    }
    c.バック = c.粗利総額 * c.バック率;
    c.給与   = c.時給計 + c.バック;
    if (c.ランク === 'プラチナ' && c.粗利総額 * 0.1 > c.時給計) {
      c.給与 = c.粗利総額 * 0.6;
    }
    c.支払額 = Math.round(c.給与 / 100) * 100;
  }

  // --- 売上内訳（P&L用） ---
  const 遠隔_税込 = sales.filter(s => s.isRemote).reduce((a, s) => a + s.販売総売上, 0);
  const 直接_税込 = sales.filter(s => !s.isRemote).reduce((a, s) => a + s.販売総売上, 0);
  const 合計_税込 = 遠隔_税込 + 直接_税込;
  const 消費税    = sales.filter(s => s.税区分 === '内税').reduce((a, s) => a + s.販売総売上 * 0.1, 0);

  const 売上総利益 = sales.reduce((a, s) => a + s.粗利総額, 0);
  const 人件費合計 = castList.reduce((a, c) => a + c.支払額, 0);
  const 人件費     = 人件費合計 + 8000;
  const 貢献利益   = 売上総利益 - 人件費合計;

  // --- 労働時間 ---
  let totalMins = 0;
  for (const w of wageRows) {
    const t = w['労働時間']; if (!t) continue;
    const parts = t.split(':');
    if (parts.length >= 2) totalMins += parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  const 労働時間 = Math.floor(totalMins / 60) + ':' + String(totalMins % 60).padStart(2, '0');

  // --- 期間検出（wage の 日付 列から） ---
  function dateKey(d) {
    if (!d) return '';
    const p = d.split('/');
    return p.length === 3 ? p[0] + p[1].padStart(2,'0') + p[2].padStart(2,'0') : '';
  }
  const wageDates = wageRows.map(w => dateKey(w['日付'])).filter(d => d);
  const period_start = wageDates.length ? wageDates.reduce((a, b) => a < b ? a : b) : '';
  const period_end   = wageDates.length ? wageDates.reduce((a, b) => a > b ? a : b) : '';

  return {
    castList,
    period: { start: period_start, end: period_end },
    pnl: {
      売上_遠隔_税込: 遠隔_税込,
      売上_直接_税込: 直接_税込,
      売上_合計_税込: 合計_税込,
      消費税,
      売上総利益,
      人件費,
      貢献利益,
      労働時間,
      労働分数: totalMins,
    },
  };
}
