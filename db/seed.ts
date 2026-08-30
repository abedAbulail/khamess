import "dotenv/config";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  branches,
  categories,
  itemPhotos,
  itemSizes,
  menuItems,
} from "./schema";
import { branchSeeds, channelMenus } from "../lib/data/menus";
import type { MenuChannel } from "../lib/types";

config({ path: ".env.local" });

const channels: MenuChannel[] = ["inside", "outside"];

async function seed() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is missing");
  }

  const db = drizzle(neon(url));
  const force = process.argv.includes("--force");

  const existing = await db.select({ id: branches.id }).from(branches);
  if (existing.length && !force) {
    console.log("Menu already seeded. Use --force to replace.");
    return;
  }

  if (existing.length) {
    await db.delete(itemPhotos);
    await db.delete(itemSizes);
    await db.delete(menuItems);
    await db.delete(categories);
  }

  const categoryRows: Array<typeof categories.$inferInsert> = [];
  const itemRows: Array<typeof menuItems.$inferInsert> = [];
  const sizeRows: Array<typeof itemSizes.$inferInsert> = [];

  for (const [branchIndex, branch] of branchSeeds.entries()) {
    const already = existing.some((row) => row.id === branch.id);
    const values = {
      slug: branch.slug,
      nameAr: branch.nameAr,
      nameEn: branch.nameEn,
      city: branch.city,
      address: branch.address,
      phone: branch.phone,
      whatsapp: branch.whatsapp,
      facebook: branch.facebook,
      instagram: branch.instagram,
      tiktok: branch.tiktok,
      heroImage: branch.heroImage,
      founded: branch.founded,
      sortOrder: branchIndex,
    };
    if (already) {
      await db.update(branches).set(values).where(eq(branches.id, branch.id));
    } else {
      await db.insert(branches).values({ id: branch.id, ...values });
    }

    for (const channel of channels) {
      const cats = channelMenus[channel];
      for (const [catIndex, category] of cats.entries()) {
        const categoryId = `${branch.id}-${channel}-${category.slug}`;
        categoryRows.push({
          id: categoryId,
          branchId: branch.id,
          channel,
          nameAr: category.nameAr,
          slug: category.slug,
          note: category.note ?? null,
          sortOrder: catIndex,
        });

        for (const [itemIndex, item] of category.items.entries()) {
          const itemId = `${branch.id}-${channel}-${category.slug}-${item.slug}`;
          itemRows.push({
            id: itemId,
            branchId: branch.id,
            categoryId,
            channel,
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            description: item.description ?? "",
            slug: item.slug,
            imageUrl: item.imageUrl ?? "",
            available: true,
            sortOrder: itemIndex,
          });
          for (const [sizeIndex, size] of item.sizes.entries()) {
            sizeRows.push({
              id: `${itemId}-${size.label}`,
              itemId,
              label: size.label,
              nameAr: size.nameAr,
              price: size.price,
              sortOrder: sizeIndex,
            });
          }
        }
      }
    }
  }

  await db.insert(categories).values(categoryRows);
  await db.insert(menuItems).values(itemRows);
  await db.insert(itemSizes).values(sizeRows);

  console.log(
    `Khamis menus seeded: ${categoryRows.length} categories, ${itemRows.length} items, ${sizeRows.length} sizes.`,
  );
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
