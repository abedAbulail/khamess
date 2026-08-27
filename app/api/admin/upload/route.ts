import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { itemPhotos, menuItems } from "@/db/schema";
import { canAccessBranch, canAccessPage, getAdminSession, logActivity } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { itemPhotoUrl } from "@/lib/media";

export const runtime = "nodejs";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(request: Request) {
  const actor = await getAdminSession();
  if (!actor || !canAccessPage(actor, "items")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  const form = await request.formData();
  const file = form.get("file");
  const itemId = String(form.get("itemId") ?? "");
  if (!(file instanceof File) || !itemId) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > 2_500_000) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const mime = ALLOWED.has(file.type) ? file.type : "image/jpeg";
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, itemId));
    if (!item || !canAccessBranch(actor, item.branchId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db
      .insert(itemPhotos)
      .values({ itemId, mime, data })
      .onConflictDoUpdate({
        target: itemPhotos.itemId,
        set: { mime, data },
      });

    const imageUrl = itemPhotoUrl(itemId, Date.now());
    await db.update(menuItems).set({ imageUrl }).where(eq(menuItems.id, itemId));
    await logActivity(actor, { action: "upload_image", page: "items", detail: item.nameAr });
    return NextResponse.json({ ok: true, url: imageUrl });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
