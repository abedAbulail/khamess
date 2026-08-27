import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin";
import { loginAdmin } from "@/lib/admin-auth";

const COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
  secure: process.env.NODE_ENV === "production",
};

export async function POST(request: Request) {
  let body: { username?: unknown; password?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const result = await loginAdmin(username, password);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: "Invalid login" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, result.token, COOKIE);
  return response;
}
