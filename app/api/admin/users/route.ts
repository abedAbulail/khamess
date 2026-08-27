import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { adminUsers } from "@/db/schema";
import { hashPassword, reservedAdminUsernames } from "@/lib/admin";
import {
  canSeeUser,
  getAdminSession,
  isFullAdmin,
  logActivity,
} from "@/lib/admin-auth";
import {
  isAdminBranchId,
  isStaffPageId,
  type AdminRole,
  type StaffPageId,
} from "@/lib/admin-pages";
import { createId } from "@/lib/cn";
import { getDb } from "@/lib/db";

function parsePages(value: unknown): StaffPageId[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry) => typeof entry === "string" && isStaffPageId(entry)))];
}

function parseBranches(value: unknown) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((entry) => typeof entry === "string" && isAdminBranchId(entry)))];
}

function normalizeUsername(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export async function POST(request: Request) {
  const actor = await getAdminSession();
  if (!actor || !isFullAdmin(actor)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const username = normalizeUsername(body.username);
  const password = typeof body.password === "string" ? body.password : "";
  const displayName =
    typeof body.displayName === "string" && body.displayName.trim()
      ? body.displayName.trim()
      : username;
  const pages = parsePages(body.pages);
  const branches = parseBranches(body.branches);
  let role: AdminRole = "staff";
  if (actor.role === "dev" && body.role === "super") role = "super";

  if (!/^[a-z0-9._-]{3,32}$/.test(username) || password.length < 6) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }
  if (reservedAdminUsernames().includes(username) || username === "dev") {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }
  if (role === "staff" && (!pages.length || !branches.length)) {
    return NextResponse.json({ error: "Missing access" }, { status: 400 });
  }

  const [taken] = await db.select({ id: adminUsers.id }).from(adminUsers).where(eq(adminUsers.username, username));
  if (taken) {
    return NextResponse.json({ error: "Username taken" }, { status: 409 });
  }

  const id = createId("user");
  await db.insert(adminUsers).values({
    id,
    username,
    passwordHash: hashPassword(password),
    displayName,
    role,
    pages: JSON.stringify(pages),
    branches: JSON.stringify(branches),
    active: true,
    createdBy: actor.id,
  });
  await logActivity(actor, {
    action: "create_user",
    page: "users",
    detail: `${displayName} (@${username})`,
  });
  return NextResponse.json({ ok: true, id });
}

export async function PATCH(request: Request) {
  const actor = await getAdminSession();
  if (!actor || !isFullAdmin(actor)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const id = String(body.id ?? "");
  const [target] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
  if (!target || !canSeeUser(actor, target.role)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.role === "dev" && actor.role !== "dev") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (target.id === actor.id && body.active === false) {
    return NextResponse.json({ error: "Cannot disable self" }, { status: 400 });
  }

  const patch: Partial<typeof adminUsers.$inferInsert> = {};
  if (typeof body.displayName === "string" && body.displayName.trim()) {
    patch.displayName = body.displayName.trim();
  }
  if (typeof body.password === "string" && body.password.length >= 6) {
    patch.passwordHash = hashPassword(body.password);
  }
  if (typeof body.active === "boolean") {
    patch.active = body.active;
  }
  if (target.role === "staff") {
    if (Array.isArray(body.pages)) patch.pages = JSON.stringify(parsePages(body.pages));
    if (Array.isArray(body.branches)) patch.branches = JSON.stringify(parseBranches(body.branches));
  }
  if (actor.role === "dev" && target.role !== "dev" && (body.role === "super" || body.role === "staff")) {
    patch.role = body.role;
  }

  if (Object.keys(patch).length) {
    await db.update(adminUsers).set(patch).where(eq(adminUsers.id, id));
  }
  await logActivity(actor, {
    action: typeof body.active === "boolean" ? "toggle_user" : "update_user",
    page: "users",
    detail: `${target.displayName} (@${target.username})`,
  });
  return NextResponse.json({ ok: true });
}
