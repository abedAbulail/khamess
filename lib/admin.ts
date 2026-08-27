import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "khamis_admin";

function secret() {
  return process.env.ADMIN_SECRET ?? process.env.ADMIN_PASSWORD ?? "admin123";
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 64).toString("hex");
  return safeEqual(next, hash);
}

export function createSessionToken(userId: string) {
  const iat = String(Date.now());
  const payload = `${userId}.${iat}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

export function parseSessionToken(value: string | undefined) {
  if (!value) return null;
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = value.slice(0, lastDot);
  const sig = value.slice(lastDot + 1);
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  if (!safeEqual(sig, expected)) return null;
  const sep = payload.lastIndexOf(".");
  if (sep <= 0) return null;
  const userId = payload.slice(0, sep);
  const iat = Number(payload.slice(sep + 1));
  if (!userId || !Number.isFinite(iat)) return null;
  if (Date.now() - iat > 7 * 24 * 60 * 60 * 1000) return null;
  return { userId, iat };
}

export function reservedAdminUsernames() {
  return [devAdminCredentials().username];
}

export function superAdminCredentials() {
  return {
    username: (process.env.ADMIN_USER ?? "admin").trim().toLowerCase(),
    password: process.env.ADMIN_PASSWORD ?? "admin123",
  };
}

export function devAdminCredentials() {
  return {
    username: (process.env.DEV_ADMIN_USER ?? "dev").trim().toLowerCase(),
    password: process.env.DEV_ADMIN_PASSWORD ?? "dev123",
  };
}
