import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

/**
 * 新人しごとシミュレーター 法人プラン（/shinjin-sim/app）のデータ。
 * - 2026-10-28 作成。トライアル（5人・2週間）を回すための最小の形
 * - 会社ごとの切り分けが要。メンバー・記録を読む関数は、必ず company_id で絞る（呼ぶ側に任せない）
 * - 保存先はコメント・お問い合わせと同じディレクトリの別ファイル（本番は /data をボリュームマウント）
 */

const DB_DIR = process.env.COMMENTS_DB_DIR || path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "shinjin.db");

let _db: Database.Database | null = null;

export function db(): Database.Database {
  if (_db) return _db;
  fs.mkdirSync(DB_DIR, { recursive: true });
  const d = new Database(DB_PATH);
  d.pragma("journal_mode = WAL");
  d.pragma("foreign_keys = ON");
  d.exec(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',      -- active / stopped
      plan TEXT NOT NULL DEFAULT 'trial',         -- trial / paid
      seat_limit INTEGER NOT NULL DEFAULT 5,      -- 遊ぶ人（player）の上限。人事（admin）は数えない
      trial_ends_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER NOT NULL REFERENCES companies(id),
      email TEXT NOT NULL UNIQUE,                 -- 小文字で保存。1人1社
      name TEXT NOT NULL,
      dept TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'player',        -- admin（人事）/ player
      status TEXT NOT NULL DEFAULT 'active',      -- active / stopped
      created_at TEXT NOT NULL,
      invited_at TEXT,
      last_login_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_members_company ON members(company_id);
    CREATE TABLE IF NOT EXISTS login_tokens (
      hash TEXT PRIMARY KEY,
      member_id INTEGER NOT NULL REFERENCES members(id),
      purpose TEXT NOT NULL,                      -- invite / login
      expires_at TEXT NOT NULL,
      used_at TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_tokens_member ON login_tokens(member_id, created_at);
    CREATE TABLE IF NOT EXISTS sessions (
      hash TEXT PRIMARY KEY,
      member_id INTEGER NOT NULL REFERENCES members(id),
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      member_id INTEGER NOT NULL REFERENCES members(id),
      company_id INTEGER NOT NULL REFERENCES companies(id),
      ep TEXT NOT NULL,                           -- mx1〜mx10（共通の10話）
      no INTEGER NOT NULL,
      title TEXT NOT NULL,
      pts INTEGER NOT NULL,
      stars INTEGER NOT NULL,
      down INTEGER NOT NULL DEFAULT 0,            -- 体力0でたおれた
      minus TEXT NOT NULL DEFAULT '[]',           -- [{pt, why}] 減点の理由＝つまずいた場面
      path TEXT NOT NULL DEFAULT '[]',            -- [{id, text, note}] 選んだ答え
      game_version TEXT,
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_member ON attempts(member_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_attempts_company ON attempts(company_id, created_at);
    -- LP からの申し込み（2026-10-29〜）。メールのリンクを押すまでは会社を作らない
    CREATE TABLE IF NOT EXISTS signups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL UNIQUE,                  -- 確認リンクのトークンのハッシュ
      company TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      ip TEXT NOT NULL DEFAULT '',
      expires_at TEXT NOT NULL,
      used_at TEXT,
      company_id INTEGER REFERENCES companies(id),
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_signups_created ON signups(created_at);
  `);
  // 後から足した列（既存のDBには ALTER で足す）
  const cols = new Set((d.prepare(`PRAGMA table_info(companies)`).all() as { name: string }[]).map((c) => c.name));
  if (!cols.has("phone")) d.exec(`ALTER TABLE companies ADD COLUMN phone TEXT NOT NULL DEFAULT ''`);
  if (!cols.has("source")) d.exec(`ALTER TABLE companies ADD COLUMN source TEXT NOT NULL DEFAULT 'ops'`); // ops（運営が作成）/ self（LPから申し込み）
  if (!cols.has("end_notified_at")) d.exec(`ALTER TABLE companies ADD COLUMN end_notified_at TEXT`);
  _db = d;
  return d;
}

export const now = () => new Date().toISOString();

export interface Company {
  id: number; name: string; status: string; plan: string; seat_limit: number; trial_ends_at: string | null; created_at: string;
  phone: string; source: string; end_notified_at: string | null;
}
export interface Member {
  id: number; company_id: number; email: string; name: string; dept: string; role: string; status: string;
  created_at: string; invited_at: string | null; last_login_at: string | null;
}
export interface Attempt {
  id: number; member_id: number; company_id: number; ep: string; no: number; title: string; pts: number; stars: number;
  down: number; minus: string; path: string; game_version: string | null; created_at: string;
}

// ── 会社（運営が /ops で作るか、LP の申し込みで作る）──
export function createCompany(name: string, trialDays: number, seatLimit: number, extra: { phone?: string; source?: "ops" | "self" } = {}): number {
  const ends = new Date(Date.now() + trialDays * 86400_000).toISOString();
  return Number(db().prepare(
    `INSERT INTO companies (name, seat_limit, trial_ends_at, phone, source, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(name, seatLimit, ends, extra.phone ?? "", extra.source ?? "ops", now()).lastInsertRowid);
}
export function getCompany(id: number): Company | undefined {
  return db().prepare(`SELECT * FROM companies WHERE id = ?`).get(id) as Company | undefined;
}
export function listCompanies(): (Company & { members: number; attempts: number })[] {
  return db().prepare(`
    SELECT c.*, (SELECT COUNT(*) FROM members m WHERE m.company_id = c.id) AS members,
           (SELECT COUNT(*) FROM attempts a WHERE a.company_id = c.id) AS attempts
      FROM companies c ORDER BY c.id DESC`).all() as (Company & { members: number; attempts: number })[];
}
export function setCompanyStatus(id: number, status: "active" | "stopped"): void {
  db().prepare(`UPDATE companies SET status = ? WHERE id = ?`).run(status, id);
}

// ── メンバー ──
export function normEmail(s: string): string {
  return s.trim().toLowerCase();
}
export function getMemberByEmail(email: string): Member | undefined {
  return db().prepare(`SELECT * FROM members WHERE email = ?`).get(normEmail(email)) as Member | undefined;
}
/** 会社で絞って1人。ほかの会社の人なら undefined */
export function getMemberInCompany(companyId: number, id: number): Member | undefined {
  return db().prepare(`SELECT * FROM members WHERE id = ? AND company_id = ?`).get(id, companyId) as Member | undefined;
}
export function listMembers(companyId: number): Member[] {
  return db().prepare(`SELECT * FROM members WHERE company_id = ? ORDER BY role = 'admin' DESC, dept, name, id`).all(companyId) as Member[];
}
export function countActivePlayers(companyId: number): number {
  return (db().prepare(`SELECT COUNT(*) AS c FROM members WHERE company_id = ? AND role = 'player' AND status = 'active'`)
    .get(companyId) as { c: number }).c;
}
export function addMember(companyId: number, m: { email: string; name: string; dept: string; role: "admin" | "player" }): number {
  return Number(db().prepare(
    `INSERT INTO members (company_id, email, name, dept, role, created_at) VALUES (?, ?, ?, ?, ?, ?)`
  ).run(companyId, normEmail(m.email), m.name, m.dept, m.role, now()).lastInsertRowid);
}
export function setMemberStatus(companyId: number, id: number, status: "active" | "stopped"): boolean {
  return db().prepare(`UPDATE members SET status = ? WHERE id = ? AND company_id = ?`).run(status, id, companyId).changes > 0;
}
export function markInvited(id: number): void {
  db().prepare(`UPDATE members SET invited_at = ? WHERE id = ?`).run(now(), id);
}

// ── 記録 ──
export function addAttempt(a: Omit<Attempt, "id" | "created_at">): number {
  return Number(db().prepare(
    `INSERT INTO attempts (member_id, company_id, ep, no, title, pts, stars, down, minus, path, game_version, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(a.member_id, a.company_id, a.ep, a.no, a.title, a.pts, a.stars, a.down, a.minus, a.path, a.game_version, now()).lastInsertRowid);
}
export function attemptsOfMember(companyId: number, memberId: number): Attempt[] {
  return db().prepare(`SELECT * FROM attempts WHERE company_id = ? AND member_id = ? ORDER BY created_at DESC, id DESC`)
    .all(companyId, memberId) as Attempt[];
}
export function attemptsOfCompany(companyId: number): Attempt[] {
  return db().prepare(`SELECT * FROM attempts WHERE company_id = ? ORDER BY created_at ASC, id ASC`).all(companyId) as Attempt[];
}
export function countRecentAttempts(memberId: number, sinceSeconds: number): number {
  const cutoff = new Date(Date.now() - sinceSeconds * 1000).toISOString();
  return (db().prepare(`SELECT COUNT(*) AS c FROM attempts WHERE member_id = ? AND created_at >= ?`)
    .get(memberId, cutoff) as { c: number }).c;
}
