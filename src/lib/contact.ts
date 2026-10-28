import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/**
 * フォームの問い合わせの保存（SQLite）。
 * - 2026-10-28 まで /api/contact はログに出すだけで、どこにも届いていなかった。
 * - 先に保存してからメールで知らせる。メールが落ちても内容は残る（mail_status で分かる）。
 * - 保存先はコメントと同じディレクトリ（本番は /data をボリュームマウント）。ファイルは分ける。
 */

const DB_DIR = process.env.COMMENTS_DB_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "contacts.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(DB_DIR, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS inquiries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source TEXT NOT NULL,
      name TEXT NOT NULL,
      company TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      subject TEXT,
      message TEXT,
      size TEXT,
      created_at TEXT NOT NULL,
      ip_hash TEXT,
      mail_status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE INDEX IF NOT EXISTS idx_inquiries_ip ON inquiries(ip_hash, created_at);
  `);
  _db = db;
  return db;
}

export interface Inquiry {
  source: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  size: string | null;
}

export function addInquiry(input: Inquiry & { ipHash: string | null }): number {
  const info = getDb()
    .prepare(
      `INSERT INTO inquiries (source, name, company, email, phone, subject, message, size, created_at, ip_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(input.source, input.name, input.company, input.email, input.phone, input.subject, input.message, input.size,
      new Date().toISOString(), input.ipHash);
  return Number(info.lastInsertRowid);
}

export function setMailStatus(id: number, status: string): void {
  getDb().prepare(`UPDATE inquiries SET mail_status = ? WHERE id = ?`).run(status, id);
}

/** レート制限用: 同一 ip_hash の直近 sinceSeconds 秒の件数 */
export function countRecentInquiries(ipHash: string, sinceSeconds: number): number {
  const cutoff = new Date(Date.now() - sinceSeconds * 1000).toISOString();
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS c FROM inquiries WHERE ip_hash = ? AND created_at >= ?`)
    .get(ipHash, cutoff) as { c: number };
  return row.c;
}
