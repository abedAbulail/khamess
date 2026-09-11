import "dotenv/config";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { and, eq, gte, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { categories, itemSizes, menuItems } from "./schema";
import { channelMenus } from "../lib/data/menus";

config({ path: ".env.local" });

const BRANCHES = ["nablus", "jenin"] as const;
const dips = channelMenus.outside.find((category) => category.slug === "dips");
const REMOVE_SLUGS = ["salads-box", "labneh-box"];

async function main() {
  if (!dips) throw new Error("dips category missing from menus.ts");
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  const db = drizzle(neon(url));

  const existingCats = await db
    .select({ id: categories.id, sortOrder: categories.sortOrder })
    .from(categories)
    .where(and(eq(categories.channel, "outside"), eq(categories.slug, "dips")));

  if (!existingCats.length) {
    const toShift = await db
      .select({ id: categories.id, sortOrder: categories.sortOrder })
      .from(categories)
      .where(and(eq(categories.channel, "outside"), gte(categories.sortOrder, 2)));
    for (const row of toShift) {
      await db
        .update(categories)
        .set({ sortOrder: row.sortOrder + 1 })
        .where(eq(categories.id, row.id));
    }
  }

  const stale = await db
    .select({ id: menuItems.id })
    .from(menuItems)
    .where(inArray(menuItems.slug, REMOVE_SLUGS));
  for (const row of stale) {
    await db.delete(menuItems).where(eq(menuItems.id, row.id));
  }

  let addedCats = 0;
  let addedItems = 0;

  for (const branchId of BRANCHES) {
    const categoryId = `${branchId}-outside-dips`;
    const already = existingCats.some((row) => row.id === categoryId);
    if (!already) {
      await db.insert(categories).values({
        id: categoryId,
        branchId,
        channel: "outside",
        nameAr: dips.nameAr,
        slug: dips.slug,
        note: dips.note ?? null,
        sortOrder: 2,
      });
      addedCats += 1;
    }

    for (const [itemIndex, item] of dips.items.entries()) {
      const itemId = `${branchId}-outside-dips-${item.slug}`;
      const [found] = await db
        .select({ id: menuItems.id })
        .from(menuItems)
        .where(eq(menuItems.id, itemId));
      if (found) continue;
      await db.insert(menuItems).values({
        id: itemId,
        branchId,
        categoryId,
        channel: "outside",
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        description: item.description ?? "",
        slug: item.slug,
        imageUrl: item.imageUrl ?? "",
        available: true,
        sortOrder: itemIndex,
      });
      await db.insert(itemSizes).values(
        item.sizes.map((size, sizeIndex) => ({
          id: `${itemId}-${size.label}`,
          itemId,
          label: size.label,
          nameAr: size.nameAr,
          price: size.price,
          sortOrder: sizeIndex,
        })),
      );
      addedItems += 1;
    }
  }

  console.log(
    `Dips menu ready. categories +${addedCats}, items +${addedItems}, removed ${stale.length} old box items.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
