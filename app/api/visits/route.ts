import { NextResponse } from "next/server";
import { recordVisit } from "@/lib/visits";

export async function POST(request: Request) {
  let body: { branchId?: unknown; page?: unknown; source?: unknown } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const page = typeof body.page === "string" ? body.page : "unknown";
  const branchId = typeof body.branchId === "string" ? body.branchId : null;
  const source = typeof body.source === "string" ? body.source : "web";

  const visit = await recordVisit({ branchId, page, source });
  return NextResponse.json(visit ?? { ok: true, skipped: true });
}
