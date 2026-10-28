import { verifyAdmin } from "@/lib/admin-auth";
import { sameOrigin } from "@/lib/shinjin/auth";
import { addMember, createCompany, db, getCompany, getMemberByEmail, getMemberInCompany, setCompanyStatus } from "@/lib/shinjin/db";
import { BASE, redirect } from "@/lib/shinjin/html";
import { sendInvite } from "@/lib/shinjin/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const back = (m: string) => redirect(`${BASE}/ops?m=${m}`);
const num = (v: FormDataEntryValue | null, lo: number, hi: number, def: number) => {
  const n = Number(v); return Number.isInteger(n) && n >= lo && n <= hi ? n : def;
};

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("forbidden", { status: 403 });
  if (!(await verifyAdmin())) return redirect("/admin/login");
  const f = await req.formData();
  const action = String(f.get("action") ?? "");

  if (action === "create") {
    const company = String(f.get("company") ?? "").trim().slice(0, 100);
    const name = String(f.get("name") ?? "").trim().slice(0, 50);
    const email = String(f.get("email") ?? "").trim();
    if (!company || !name || !/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(email)) return back("bad");
    if (getMemberByEmail(email)) return back("dup");
    const cid = createCompany(company, num(f.get("days"), 1, 365, 14), num(f.get("seats"), 1, 500, 5));
    const mid = addMember(cid, { email, name, dept: "", role: "admin" });
    try { await sendInvite(getMemberInCompany(cid, mid)!, getCompany(cid)!, "合同会社データロー"); }
    catch (e) { console.error("[shinjin] 招待メールの送信に失敗:", e instanceof Error ? e.message : e); return back("mailfail"); }
    return back("created");
  }

  const c = getCompany(Number(f.get("id")));
  if (!c) return back("bad");
  if (action === "stop") setCompanyStatus(c.id, "stopped");
  else if (action === "start") setCompanyStatus(c.id, "active");
  else if (action === "paid") db().prepare(`UPDATE companies SET plan = 'paid' WHERE id = ?`).run(c.id);
  else if (action === "extend") {
    const base = Math.max(Date.now(), c.trial_ends_at ? Date.parse(c.trial_ends_at) : 0);
    db().prepare(`UPDATE companies SET trial_ends_at = ?, end_notified_at = NULL WHERE id = ?`).run(new Date(base + 7 * 86400_000).toISOString(), c.id);
  } else if (action === "seats") db().prepare(`UPDATE companies SET seat_limit = ? WHERE id = ?`).run(num(f.get("seats"), 1, 500, c.seat_limit), c.id);
  else return back("bad");
  return back("done");
}
