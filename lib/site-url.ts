import { headers } from "next/headers";

function isLocalHost(value: string) {
  return /(localhost|127\.0\.0\.1|0\.0\.0\.0)/i.test(value);
}

function normalizeOrigin(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function envOrigin() {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv && !isLocalHost(fromEnv)) return normalizeOrigin(fromEnv);

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return normalizeOrigin(production);

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) return normalizeOrigin(vercelUrl);

  return fromEnv ? normalizeOrigin(fromEnv) : "";
}

export function siteUrlSync() {
  return envOrigin() || "http://localhost:3001";
}

export async function siteUrl() {
  const configured = envOrigin();
  if (configured && !isLocalHost(configured)) return configured;

  try {
    const h = await headers();
    const host = h.get("x-forwarded-host") ?? h.get("host");
    if (host && !isLocalHost(host)) {
      const proto = h.get("x-forwarded-proto") ?? "https";
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // not in a request
  }

  return configured || "http://localhost:3001";
}
