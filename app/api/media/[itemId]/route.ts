import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { itemPhotos } from "@/db/schema";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;
  if (!itemId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const db = getDb();
  if (!db) return new NextResponse("Not found", { status: 404 });

  try {
    const [photo] = await db
      .select({ mime: itemPhotos.mime, data: itemPhotos.data })
      .from(itemPhotos)
      .where(eq(itemPhotos.itemId, itemId))
      .limit(1);
    if (!photo?.data) {
      return new NextResponse("Not found", { status: 404 });
    }

    const bytes = Buffer.from(photo.data, "base64");
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": photo.mime || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("[media]", error);
    return new NextResponse("Not found", { status: 404 });
  }
}
