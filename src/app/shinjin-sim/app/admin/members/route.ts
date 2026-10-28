import { currentWho, sameOrigin } from "@/lib/shinjin/auth";
import { addMember, countActivePlayers, getMemberByEmail, getMemberInCompany } from "@/lib/shinjin/db";
import { BASE, redirect } from "@/lib/shinjin/html";
import { sendInvite } from "@/lib/shinjin/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const back = (m: string) => redirect(`${BASE}/admin?m=${m}`);

/** 人事が、自分の会社に人を登録して招待する。会社はセッションで決める（フォームの値は使わない） */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("forbidden", { status: 403 });
  const who = await currentWho();
  if (!who || who.member.role !== "admin") return redirect(BASE);
  const f = await req.formData();
  const email = String(f.get("email") ?? "").trim();
  const name = String(f.get("name") ?? "").trim().slice(0, 50);
  const dept = String(f.get("dept") ?? "").trim().slice(0, 50);
  const role = f.get("role") === "admin" ? "admin" : "player";
  if (!name || email.length > 254 || !/^[^@\s<>"]+@[^@\s<>"]+\.[^@\s<>"]+$/.test(email)) return back("bad");
  if (getMemberByEmail(email)) return back("dup");
  if (role === "player" && countActivePlayers(who.company.id) >= who.company.seat_limit) return back("full");

  const id = addMember(who.company.id, { email, name, dept, role });
  const m = getMemberInCompany(who.company.id, id)!;
  try {
    await sendInvite(m, who.company, `${who.company.name} の ${who.member.name} さん`);
  } catch (e) {
    console.error("[shinjin] 招待メールの送信に失敗:", e instanceof Error ? e.message : e);
    return back("mailfail");
  }
  return back("added");
}
