// db.js - IndexedDB wrapper for salary management
'use strict';

const SalaryDB = (() => {
  const DB_NAME = 'xinglang_salary';
  const DB_VERSION = 1;
  let _db = null;

  function open() {
    if (_db) return Promise.resolve(_db);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = e => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('cast_master')) {
          db.createObjectStore('cast_master', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('cast_rank')) {
          db.createObjectStore('cast_rank', { keyPath: 'ランク' });
        }
        if (!db.objectStoreNames.contains('salary_history')) {
          const s = db.createObjectStore('salary_history', { keyPath: ['店舗', 'period_start', 'period_end'] });
          s.createIndex('by_store', '店舗');
        }
      };
      req.onsuccess  = e => { _db = e.target.result; resolve(_db); };
      req.onerror    = e => reject(e.target.error);
    });
  }

  function store(name, mode = 'readonly') {
    return open().then(db => db.transaction(name, mode).objectStore(name));
  }

  function p(req) {
    return new Promise((res, rej) => {
      req.onsuccess = e => res(e.target.result);
      req.onerror   = e => rej(e.target.error);
    });
  }

  function getAll(name)      { return store(name).then(s => p(s.getAll())).then(r => r || []); }
  function get(name, key)    { return store(name).then(s => p(s.get(key))); }
  function put(name, rec)    { return store(name, 'readwrite').then(s => p(s.put(rec))); }
  function del(name, key)    { return store(name, 'readwrite').then(s => p(s.delete(key))); }
  function count(name)       { return store(name).then(s => p(s.count())); }

  async function bulkReplace(name, records) {
    const s = await store(name, 'readwrite');
    await new Promise((res, rej) => { const r = s.clear(); r.onsuccess = res; r.onerror = e => rej(e.target.error); });
    for (const rec of records) {
      await new Promise((res, rej) => { const r = s.put(rec); r.onsuccess = res; r.onerror = e => rej(e.target.error); });
    }
  }

  // Salary history: half-month → overwritable; >20 days → protected
  async function saveHistory(record) {
    const { 店舗, period_start, period_end } = record;
    const s  = new Date(period_start.slice(0,4), period_start.slice(4,6)-1, period_start.slice(6,8));
    const e  = new Date(period_end.slice(0,4),   period_end.slice(4,6)-1,   period_end.slice(6,8));
    const days = (e - s) / 86400000 + 1;

    if (days > 20) {
      // Monthly record: protect from overwrite
      const existing = await get('salary_history', [店舗, period_start, period_end]);
      if (existing) return { saved: false, reason: 'monthly_exists' };
    }
    await put('salary_history', record);
    return { saved: true };
  }

  return { getAll, get, put, del, count, bulkReplace, saveHistory };
})();
