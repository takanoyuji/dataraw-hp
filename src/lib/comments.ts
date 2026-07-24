import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import crypto from "crypto";

/**
 * コメントの保存（SQLite）。
 * - 保存先は `data/comments.db`（.gitignore 済み）。本番は永続FS（VPS/Docker のマウント）前提。
 * - 即時公開（status='visible'）。管理画面から削除できる。
 * - 本文はプレーンテキストのみ。表示側は React の標準エスケープで XSS を防ぐ（HTMLは解釈しない）。
 */

const DB_DIR = process.env.COMMENTS_DB_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "comments.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      article_slug TEXT NOT NULL,
      name TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'visible',
      ip_hash TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_comments_slug
      ON comments(article_slug, status, created_at);
  `);
  _db = db;
  return db;
}

export interface Comment {
  id: number;
  article_slug: string;
  name: string;
  body: string;
  created_at: string;
}

export interface AdminComment extends Comment {
  status: string;
  ip_hash: string | null;
}

/** 公開表示用: 指定記事の可視コメント（古い順） */
export function getComments(slug: string): Comment[] {
  return getDb()
    .prepare(
      `SELECT id, article_slug, name, body, created_at
         FROM comments
        WHERE article_slug = ? AND status = 'visible'
        ORDER BY created_at ASC, id ASC`
    )
    .all(slug) as Comment[];
}

export function addComment(input: {
  slug: string;
  name: string;
  body: string;
  ipHash: string | null;
}): Comment {
  const created_at = new Date().toISOString();
  const info = getDb()
    .prepare(
      `INSERT INTO comments (article_slug, name, body, created_at, status, ip_hash)
       VALUES (?, ?, ?, ?, 'visible', ?)`
    )
    .run(input.slug, input.name, input.body, created_at, input.ipHash);
  return {
    id: Number(info.lastInsertRowid),
    article_slug: input.slug,
    name: input.name,
    body: input.body,
    created_at,
  };
}

/** レート制限用: 同一 ip_hash の直近 sinceSeconds 秒の投稿数 */
export function countRecentByIp(ipHash: string, sinceSeconds: number): number {
  const cutoff = new Date(Date.now() - sinceSeconds * 1000).toISOString();
  const row = getDb()
    .prepare(
      `SELECT COUNT(*) AS c FROM comments WHERE ip_hash = ? AND created_at >= ?`
    )
    .get(ipHash, cutoff) as { c: number };
  return row.c;
}

/** 管理用: 全コメント（新しい順） */
export function getAllComments(): AdminComment[] {
  return getDb()
    .prepare(`SELECT * FROM comments ORDER BY created_at DESC, id DESC`)
    .all() as AdminComment[];
}

export function deleteComment(id: number): boolean {
  const info = getDb().prepare(`DELETE FROM comments WHERE id = ?`).run(id);
  return info.changes > 0;
}

/** 生IPは保存しない。ソルト付きハッシュ（レート制限・重複検知用） */
export function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  const salt = process.env.COMMENTS_IP_SALT || "dataraw-comments-salt";
  return crypto
    .createHash("sha256")
    .update(ip + salt)
    .digest("hex")
    .slice(0, 32);
}
