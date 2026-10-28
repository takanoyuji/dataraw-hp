import { currentWho, dropSessions, sameOrigin } from "@/lib/shinjin/auth";
import { countActivePlayers, getMemberInCompany, setMemberStatus } from "@/lib/shinjin/db";
import { BASE, redirect } from "@/lib/shinjin/html";
import { sendInvite } from "@/lib/shinjin/mail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const back = (m: string) => redirect(`${BASE}/admin?m=${m}`);

/** 招待の送り直し・止める・再開。相手は必ず自分の会社の人に絞る */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("forbidden", { status: 403 });
  const who = await currentWho();
  if (!who || who.member.role !== "admin") return redirect(BASE);
  const f = await req.formData();
  const target = getMemberInCompany(who.company.id, Number(f.get("id")));
  if (!target) return back("");
  const action = String(f.get("action") ?? "");

  if (action === "resend" && target.status === "active") {
    try { await sendInvite(target, who.company, `${who.company.name} の ${who.member.name} さん`); } catch { return back("mailfail"); }
    return back("resent");
  }
  if (action === "stop") {
    if (target.id === who.member.id) return back("self");
    setMemberStatus(who.company.id, target.id, "stopped");
    dropSessions(target.id);
    return back("stopped");
  }
  if (action === "start") {
    if (target.role === "player" && countActivePlayers(who.company.id) >= who.company.seat_limit) return back("full");
    setMemberStatus(who.company.id, target.id, "active");
    return back("started");
  }
  return back("");
}
