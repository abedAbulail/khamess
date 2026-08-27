import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (cached) return cached;

  try {
    cached = drizzle(neon(url), { schema });
    return cached;
  } catch (error) {
    console.error("[db] Failed to initialize Neon connection.", error);
    return null;
  }
}
