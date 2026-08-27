import { NextResponse } from "next/server";
import { orderItems, orders } from "@/db/schema";
import { createId } from "@/lib/cn";
import { getDb } from "@/lib/db";

type IncomingItem = {
  itemId?: unknown;
  nameAr?: unknown;
  sizeLabel?: unknown;
  quantity?: unknown;
  price?: unknown;
};

export async function POST(request: Request) {
  let body: {
    branchId?: unknown;
    customerName?: unknown;
    phone?: unknown;
    notes?: unknown;
    items?: unknown;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const branchId = typeof body.branchId === "string" ? body.branchId : "";
  const customerName =
    typeof body.customerName === "string" ? body.customerName.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const notes = typeof body.notes === "string" ? body.notes.trim() : "";

  if (!branchId || !customerName || !phone) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "Items required" }, { status: 400 });
  }

  const parsed = (body.items as IncomingItem[]).map((item) => ({
    itemId: typeof item.itemId === "string" ? item.itemId : null,
    nameAr: typeof item.nameAr === "string" ? item.nameAr : "صنف",
    sizeLabel: typeof item.sizeLabel === "string" ? item.sizeLabel : "",
    quantity: Number(item.quantity) || 1,
    price: Number(item.price) || 0,
  }));

  const subtotal = parsed.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const orderId = createId("ord");
  const db = getDb();

  if (db) {
    try {
      await db.insert(orders).values({
        id: orderId,
        branchId,
        customerName,
        phone,
        notes: notes || null,
        subtotal,
        status: "new",
        source: "whatsapp",
      });
      await db.insert(orderItems).values(
        parsed.map((item) => ({
          id: createId("line"),
          orderId,
          itemId: item.itemId,
          nameAr: item.nameAr,
          sizeLabel: item.sizeLabel,
          quantity: item.quantity,
          price: item.price,
        })),
      );
      return NextResponse.json({ id: orderId, subtotal, persisted: true });
    } catch (error) {
      console.error("[orders]", error);
    }
  }

  return NextResponse.json({ id: orderId, subtotal, persisted: false });
}
