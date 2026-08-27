import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { adminActivity, adminUsers } from "@/db/schema";
import {
  ADMIN_COOKIE,
  createSessionToken,
  devAdminCredentials,
  hashPassword,
  parseSessionToken,
  superAdminCredentials,
  verifyPassword,
} from "@/lib/admin";
import {
  canAccessBranch,
  canAccessPage,
  firstAllowedPath,
  isAdminBranchId,
  isFullAdmin,
  isStaffPageId,
  type AdminActor,
  type AdminPageId,
  type AdminRole,
  type StaffPageId,
} from "@/lib/admin-pages";
import { createId } from "@/lib/cn";
import { getDb } from "@/lib/db";

export type { AdminActor, AdminPageId } from "@/lib/admin-pages";

const DEV_ID = "user_dev";
const SUPER_ID = "user_super";
let ensured = false;

function parseList(value: string, kind: "pages"): StaffPageId[];
function parseList(value: string, kind: "branches"): AdminActor["branches"];
function parseList(value: string, kind: "pages" | "branches") {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    if (kind === "pages") return parsed.filter((entry) => typeof entry === "string" && isStaffPageId(entry));
    return parsed.filter((entry) => typeof entry === "string" && isAdminBranchId(entry));
  } catch {
    return [];
  }
}

function asRole(value: string): AdminRole {
  if (value === "dev" || value === "super" || value === "staff") return value;
  return "staff";
}

function toActor(row: typeof adminUsers.$inferSelect): AdminActor {
  const role = asRole(row.role);
  return {
    id: row.id,
    username: row.username,
    displayName: row.displayName,
    role,
    pages: role === "staff" ? parseList(row.pages, "pages") : allStaffPages(),
    branches: role === "staff" ? parseList(row.branches, "branches") : ["nablus", "jenin"],
  };
}

function allStaffPages(): StaffPageId[] {
  return ["dashboard", "categories", "items", "orders", "visitors", "qr", "settings"];
}

export async function ensureAdminUsers() {
  const db = getDb();
  if (!db || ensured) return;
  try {
    const existing = await db.select({ id: adminUsers.id, username: adminUsers.username }).from(adminUsers);
    const usernames = new Set(existing.map((row) => row.username));
    const ids = new Set(existing.map((row) => row.id));
    const dev = devAdminCredentials();
    const superAdmin = superAdminCredentials();

    if (!ids.has(DEV_ID) && !usernames.has(dev.username)) {
      await db.insert(adminUsers).values({
        id: DEV_ID,
        username: dev.username,
        passwordHash: hashPassword(dev.password),
        displayName: "Developer",
        role: "dev",
        pages: "[]",
        branches: "[]",
        active: true,
      });
    }

    if (!ids.has(SUPER_ID) && !usernames.has(superAdmin.username)) {
      await db.insert(adminUsers).values({
        id: SUPER_ID,
        username: superAdmin.username,
        passwordHash: hashPassword(superAdmin.password),
        displayName: "مدير عام",
        role: "super",
        pages: "[]",
        branches: "[]",
        active: true,
      });
    }
    ensured = true;
  } catch (error) {
    console.error("[admin users]", error);
  }
}

export async function getAdminSession(): Promise<AdminActor | null> {
  const db = getDb();
  if (!db) return null;
  await ensureAdminUsers();
  const jar = await cookies();
  const parsed = parseSessionToken(jar.get(ADMIN_COOKIE)?.value);
  if (!parsed) return null;
  try {
    const [row] = await db.select().from(adminUsers).where(eq(adminUsers.id, parsed.userId));
    if (!row || !row.active) return null;
    const seen = row.lastSeenAt ? new Date(row.lastSeenAt).getTime() : 0;
    if (Date.now() - seen > 120_000) {
      await db
        .update(adminUsers)
        .set({ lastSeenAt: new Date() })
        .where(eq(adminUsers.id, row.id));
    }
    return toActor(row);
  } catch {
    return null;
  }
}

export async function requireAdminPage(page: AdminPageId): Promise<AdminActor> {
  const actor = await getAdminSession();
  if (!actor) redirect("/admin");
  if (!canAccessPage(actor, page)) redirect(firstAllowedPath(actor));
  return actor;
}

export async function requireActor() {
  const actor = await getAdminSession();
  if (!actor) return null;
  return actor;
}

export function scopedBranches<T extends { id: string }>(actor: AdminActor, branches: T[]) {
  return branches.filter((branch) => canAccessBranch(actor, branch.id));
}

export function scopedMenus<T extends { id: string }>(actor: AdminActor, menus: T[]) {
  return menus.filter((menu) => canAccessBranch(actor, menu.id));
}

export function scopedByBranch<T extends { branchId?: string | null }>(actor: AdminActor, rows: T[]) {
  if (isFullAdmin(actor)) return rows;
  return rows.filter((row) => row.branchId && canAccessBranch(actor, row.branchId));
}

export async function logActivity(
  actor: Pick<AdminActor, "id" | "username" | "role">,
  entry: { action: string; page?: string; detail?: string },
) {
  const db = getDb();
  if (!db) return;
  try {
    await db.insert(adminActivity).values({
      id: createId("act"),
      userId: actor.id,
      username: actor.username,
      role: actor.role,
      action: entry.action,
      page: entry.page ?? "",
      detail: entry.detail ?? "",
    });
  } catch (error) {
    console.error("[admin activity]", error);
  }
}

export async function loginAdmin(username: string, password: string) {
  const db = getDb();
  if (!db) return { ok: false as const, error: "no-db" };
  await ensureAdminUsers();
  const normalized = username.trim().toLowerCase();
  const [row] = await db.select().from(adminUsers).where(eq(adminUsers.username, normalized));
  if (!row || !row.active || !verifyPassword(password, row.passwordHash)) {
    return { ok: false as const, error: "invalid" };
  }
  const actor = toActor(row);
  await db
    .update(adminUsers)
    .set({ lastLoginAt: new Date(), lastSeenAt: new Date() })
    .where(eq(adminUsers.id, row.id));
  await logActivity(actor, { action: "login", page: "login" });
  return { ok: true as const, actor, token: createSessionToken(row.id) };
}

export function canSeeUser(viewer: AdminActor, targetRole: string) {
  if (viewer.role === "dev") return true;
  if (viewer.role === "super") return targetRole !== "dev";
  return false;
}

function toIso(value: Date | string | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

export async function listAdminUsers(viewer: AdminActor) {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(adminUsers);
  return rows
    .filter((row) => canSeeUser(viewer, row.role))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((row) => ({
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      role: asRole(row.role),
      pages: asRole(row.role) === "staff" ? parseList(row.pages, "pages") : allStaffPages(),
      branches:
        asRole(row.role) === "staff"
          ? parseList(row.branches, "branches")
          : (["nablus", "jenin"] as AdminActor["branches"]),
      active: row.active,
      createdAt: toIso(row.createdAt) ?? "",
      lastLoginAt: toIso(row.lastLoginAt),
      lastSeenAt: toIso(row.lastSeenAt),
    }));
}

export async function listActivity(viewer: AdminActor, limit = 400) {
  const db = getDb();
  if (!db) return [];
  const rows = await db
    .select()
    .from(adminActivity)
    .orderBy(desc(adminActivity.createdAt))
    .limit(limit);
  return rows
    .filter((row) => canSeeUser(viewer, row.role))
    .map((row) => ({
      ...row,
      createdAt: toIso(row.createdAt) ?? "",
    }));
}

export { canAccessBranch, canAccessPage, firstAllowedPath, isFullAdmin };
