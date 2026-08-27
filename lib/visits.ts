import { visits } from "@/db/schema";
import { createId } from "@/lib/cn";
import { getDb } from "@/lib/db";
import type { VisitRecord } from "@/lib/types";

export async function recordVisit(input: {
  branchId?: string | null;
  page: string;
  source?: string;
}): Promise<VisitRecord | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const row = {
      id: createId("vis"),
      branchId: input.branchId ?? null,
      page: input.page,
      source: input.source ?? "web",
    };
    await db.insert(visits).values(row);
    return { ...row, createdAt: new Date() };
  } catch {
    return null;
  }
}
