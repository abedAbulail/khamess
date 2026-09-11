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
  const slugParam = String(form.get("slug") ?? "");
  if (!(file instanceof File) || (!itemId && !slugParam)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > 2_500_000) {
    return NextResponse.json({ error: "File too large" }, { status: 400 });
  }

  const mime = ALLOWED.has(file.type) ? file.type : "image/jpeg";
  const data = Buffer.from(await file.arrayBuffer()).toString("base64");

  try {
    let targets = [];
    if (slugParam) {
      targets = await db.select().from(menuItems).where(eq(menuItems.slug, slugParam));
    } else {
      const [item] = await db.select().from(menuItems).where(eq(menuItems.id, itemId));
      if (!item) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      targets = await db.select().from(menuItems).where(eq(menuItems.slug, item.slug));
    }

    const allowed = targets.filter((item) => canAccessBranch(actor, item.branchId));
    if (!allowed.length) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let url = "";
    for (const item of allowed) {
      await db
        .insert(itemPhotos)
        .values({ itemId: item.id, mime, data })
        .onConflictDoUpdate({
          target: itemPhotos.itemId,
          set: { mime, data },
        });
      const imageUrl = itemPhotoUrl(item.id, Date.now());
      await db.update(menuItems).set({ imageUrl }).where(eq(menuItems.id, item.id));
      if (item.id === itemId || !url) url = imageUrl;
    }

    await logActivity(actor, {
      action: "upload_image",
      page: "items",
      detail: allowed[0]?.nameAr ?? slugParam,
    });
    return NextResponse.json({ ok: true, url });
  } catch (error) {
    console.error("[upload]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
