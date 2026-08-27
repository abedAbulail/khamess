import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { branches, categories, itemPhotos, itemSizes, menuItems, orders } from "@/db/schema";
import {
  canAccessBranch,
  canAccessPage,
  getAdminSession,
  logActivity,
  type AdminActor,
} from "@/lib/admin-auth";
import type { AdminPageId } from "@/lib/admin-pages";
import { createId } from "@/lib/cn";
import { getDb } from "@/lib/db";
import { isMenuChannel } from "@/lib/queries";

function sizeLabelFromName(nameAr: string) {
  if (nameAr.includes("صغير")) return "S";
  if (nameAr.includes("وسط")) return "M";
  if (nameAr.includes("كبير")) return "L";
  return "one";
}

function deny(actor: AdminActor | null, page: AdminPageId, branchId?: string) {
  if (!actor) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessPage(actor, page)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (branchId && !canAccessBranch(actor, branchId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function PATCH(request: Request) {
  const actor = await getAdminSession();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type : "";

  try {
    if (type === "branch") {
      const id = String(body.id ?? "");
      const blocked = deny(actor, "settings", id);
      if (blocked) return blocked;
      await db
        .update(branches)
        .set({
          ...(typeof body.phone === "string" ? { phone: body.phone } : {}),
          ...(typeof body.whatsapp === "string" ? { whatsapp: body.whatsapp } : {}),
          ...(typeof body.facebook === "string" ? { facebook: body.facebook } : {}),
          ...(typeof body.instagram === "string" ? { instagram: body.instagram } : {}),
          ...(typeof body.tiktok === "string" ? { tiktok: body.tiktok } : {}),
          ...(typeof body.address === "string" ? { address: body.address } : {}),
        })
        .where(eq(branches.id, id));
      await logActivity(actor!, {
        action: "update_branch",
        page: "settings",
        detail: id,
      });
      return NextResponse.json({ ok: true });
    }

    if (type === "category") {
      const id = String(body.id ?? "");
      const [row] = await db.select().from(categories).where(eq(categories.id, id));
      const blocked = deny(actor, "categories", row?.branchId);
      if (blocked) return blocked;
      await db
        .update(categories)
        .set({
          ...(typeof body.nameAr === "string" ? { nameAr: body.nameAr } : {}),
          ...(typeof body.note === "string" ? { note: body.note } : {}),
          ...(typeof body.sortOrder === "number" ? { sortOrder: body.sortOrder } : {}),
        })
        .where(eq(categories.id, id));
      await logActivity(actor!, {
        action: "update_category",
        page: "categories",
        detail: typeof body.nameAr === "string" ? body.nameAr : id,
      });
      return NextResponse.json({ ok: true });
    }

    if (type === "item") {
      const id = String(body.id ?? "");
      const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id));
      const blocked = deny(actor, "items", row?.branchId);
      if (blocked) return blocked;
      await db
        .update(menuItems)
        .set({
          ...(typeof body.nameAr === "string" ? { nameAr: body.nameAr } : {}),
          ...(typeof body.nameEn === "string" ? { nameEn: body.nameEn } : {}),
          ...(typeof body.description === "string"
            ? { description: body.description }
            : {}),
          ...(typeof body.categoryId === "string" ? { categoryId: body.categoryId } : {}),
          ...(typeof body.available === "boolean" ? { available: body.available } : {}),
          ...(typeof body.imageUrl === "string" ? { imageUrl: body.imageUrl } : {}),
        })
        .where(eq(menuItems.id, id));

      if (typeof body.imageUrl === "string" && !body.imageUrl.trim()) {
        await db.delete(itemPhotos).where(eq(itemPhotos.itemId, id));
      }

      if (Array.isArray(body.sizes)) {
        const incoming = body.sizes as Array<{
          id?: string;
          label?: string;
          nameAr?: string;
          price?: number;
        }>;
        const existing = await db.select().from(itemSizes).where(eq(itemSizes.itemId, id));
        const keepIds = new Set(incoming.map((size) => size.id).filter(Boolean));
        for (const size of existing) {
          if (!keepIds.has(size.id)) {
            await db.delete(itemSizes).where(eq(itemSizes.id, size.id));
          }
        }
        for (const [index, size] of incoming.entries()) {
          const nameAr = String(size.nameAr ?? "حجم واحد").trim() || "حجم واحد";
          const label = String(size.label ?? sizeLabelFromName(nameAr));
          const price = Number(size.price) || 0;
          if (size.id) {
            await db
              .update(itemSizes)
              .set({ nameAr, label, price, sortOrder: index })
              .where(eq(itemSizes.id, size.id));
          } else {
            await db.insert(itemSizes).values({
              id: createId("size"),
              itemId: id,
              label,
              nameAr,
              price,
              sortOrder: index,
            });
          }
        }
      }
      await logActivity(actor!, {
        action: "update_item",
        page: "items",
        detail: typeof body.nameAr === "string" ? body.nameAr : id,
      });
      return NextResponse.json({ ok: true });
    }

    if (type === "order-status") {
      const id = String(body.id ?? "");
      const [order] = await db.select().from(orders).where(eq(orders.id, id));
      const blocked = deny(actor, "orders", order?.branchId);
      if (blocked) return blocked;
      const status = String(body.status ?? "new");
      await db.update(orders).set({ status }).where(eq(orders.id, id));
      await logActivity(actor!, {
        action: "update_order",
        page: "orders",
        detail: `${id.slice(-6)} → ${status}`,
      });
      return NextResponse.json({ ok: true });
    }
  } catch (error) {
    console.error("[admin patch]", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ error: "Unknown type" }, { status: 400 });
}

export async function POST(request: Request) {
  const actor = await getAdminSession();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type : "item";

  if (type === "category") {
    const branchId = String(body.branchId ?? "");
    const blocked = deny(actor, "categories", branchId);
    if (blocked) return blocked;
    const nameAr = String(body.nameAr ?? "").trim();
    const channel = isMenuChannel(String(body.channel ?? ""))
      ? String(body.channel)
      : "outside";
    if (!branchId || !nameAr) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const id = createId("cat");
    await db.insert(categories).values({
      id,
      branchId,
      channel,
      nameAr,
      slug: id.slice(-10),
      note: typeof body.note === "string" ? body.note : null,
      sortOrder: Number(body.sortOrder) || 99,
    });
    await logActivity(actor!, { action: "create_category", page: "categories", detail: nameAr });
    return NextResponse.json({ ok: true, id });
  }

  const branchId = String(body.branchId ?? "");
  const categoryId = String(body.categoryId ?? "");
  const nameAr = String(body.nameAr ?? "").trim();
  const blocked = deny(actor, "items", branchId);
  if (blocked) return blocked;
  if (!branchId || !categoryId || !nameAr) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const [category] = await db.select().from(categories).where(eq(categories.id, categoryId));
  if (category && !canAccessBranch(actor!, category.branchId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const channel = isMenuChannel(String(body.channel ?? category?.channel ?? ""))
    ? String(body.channel ?? category?.channel)
    : "outside";

  const slug = nameAr.replace(/\s+/g, "-").slice(0, 40);
  const itemId = createId("item");
  const incomingSizes = Array.isArray(body.sizes)
    ? (body.sizes as Array<{ nameAr?: string; label?: string; price?: number }>)
    : [];
  const sizes = incomingSizes.length
    ? incomingSizes
    : [{ nameAr: "حجم واحد", label: "one", price: Number(body.price) || 0 }];

  await db.insert(menuItems).values({
    id: itemId,
    branchId,
    categoryId,
    channel,
    nameAr,
    nameEn: String(body.nameEn ?? ""),
    description: String(body.description ?? ""),
    slug: `${slug}-${itemId.slice(-6)}`,
    imageUrl: typeof body.imageUrl === "string" ? body.imageUrl : "",
    available: true,
    sortOrder: 99,
  });
  await db.insert(itemSizes).values(
    sizes.map((size, index) => {
      const sizeName = String(size.nameAr ?? "حجم واحد").trim() || "حجم واحد";
      return {
        id: createId("size"),
        itemId,
        label: String(size.label ?? sizeLabelFromName(sizeName)),
        nameAr: sizeName,
        price: Number(size.price) || 0,
        sortOrder: index,
      };
    }),
  );
  await logActivity(actor!, { action: "create_item", page: "items", detail: nameAr });
  return NextResponse.json({ ok: true, id: itemId });
}

export async function DELETE(request: Request) {
  const actor = await getAdminSession();
  const db = getDb();
  if (!db) return NextResponse.json({ error: "No database" }, { status: 503 });
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const kind = searchParams.get("kind") ?? "item";
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (kind === "category") {
    const [row] = await db.select().from(categories).where(eq(categories.id, id));
    const blocked = deny(actor, "categories", row?.branchId);
    if (blocked) return blocked;
    await db.delete(categories).where(eq(categories.id, id));
    await logActivity(actor!, { action: "delete_category", page: "categories", detail: row?.nameAr ?? id });
  } else {
    const [row] = await db.select().from(menuItems).where(eq(menuItems.id, id));
    const blocked = deny(actor, "items", row?.branchId);
    if (blocked) return blocked;
    await db.delete(menuItems).where(eq(menuItems.id, id));
    await logActivity(actor!, { action: "delete_item", page: "items", detail: row?.nameAr ?? id });
  }
  return NextResponse.json({ ok: true });
}
