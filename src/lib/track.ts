import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/**
 * 記事の「表示」と「読了」の計測（自前・SQLite）。
 * - 保存先は `data/analytics.db`（.gitignore 済み）。本番は永続FS(Docker /data マウント)前提。
 * - 生IPは保存しない。訪問者は「IP+UA+当日」のハッシュ（= 日別ユニーク、日跨ぎで追跡しない）。
 * - (slug, kind, visitor, day) を UNIQUE にし、同日同一訪問者の二重計上を防ぐ。
 *   → 集計値は「日別ユニークの延べ」。リロードで水増しされない。
 */

const DB_DIR = process.env.COMMENTS_DB_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "analytics.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS article_events (
      slug       TEXT NOT NULL,
      kind       TEXT NOT NULL,          -- 'view' | 'read'
      visitor    TEXT NOT NULL,
      day        TEXT NOT NULL,          -- YYYY-MM-DD
      created_at TEXT NOT NULL,
      UNIQUE(slug, kind, visitor, day)
    );
    CREATE INDEX IF NOT EXISTS idx_events_slug ON article_events(slug, kind);
  `);
  _db = db;
  return db;
}

export type EventKind = "view" | "read";

/** 記録（同日同一訪問者は無視＝二重計上しない）。新規計上できたら true */
export function recordEvent(
  slug: string,
  kind: EventKind,
  visitor: string,
  day: string
): boolean {
  const info = getDb()
    .prepare(
      `INSERT OR IGNORE INTO article_events (slug, kind, visitor, day, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .run(slug, kind, visitor, day, new Date().toISOString());
  return info.changes > 0;
}

export interface ArticleStat {
  slug: string;
  views: number;
  reads: number;
  /** 読了率 0〜1（views=0 のときは 0） */
  readRate: number;
}

/** 記事別の 表示数 / 読了数 / 読了率（表示数の多い順） */
export function getStats(): ArticleStat[] {
  const rows = getDb()
    .prepare(
      `SELECT slug,
              SUM(kind = 'view') AS views,
              SUM(kind = 'read') AS reads
         FROM article_events
        GROUP BY slug`
    )
    .all() as { slug: string; views: number; reads: number }[];

  return rows
    .map((r) => ({
      slug: r.slug,
      views: r.views ?? 0,
      reads: r.reads ?? 0,
      readRate: r.views ? (r.reads ?? 0) / r.views : 0,
    }))
    .sort((a, b) => b.views - a.views);
}
