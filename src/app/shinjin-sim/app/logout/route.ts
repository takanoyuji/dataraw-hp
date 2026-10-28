import { NextResponse } from "next/server";
import { endSession, sameOrigin, sessionCookie } from "@/lib/shinjin/auth";
import { BASE } from "@/lib/shinjin/html";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("forbidden", { status: 403 });
  await endSession();
  const res = new NextResponse(null, { status: 303, headers: { location: `${BASE}?m=out` } });
  res.cookies.set(sessionCookie("", 0));
  return res;
}
