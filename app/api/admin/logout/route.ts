import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin";
import { getAdminSession, logActivity } from "@/lib/admin-auth";

export async function POST() {
  const actor = await getAdminSession();
  if (actor) {
    await logActivity(actor, { action: "logout", page: "login" });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
