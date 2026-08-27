import { and, eq } from "drizzle-orm";
import {
  branches,
  categories,
  itemSizes,
  menuItems,
  orderItems,
  orders,
  visits,
} from "@/db/schema";
import { getDb } from "@/lib/db";
import { branchSeeds, channelMenus } from "@/lib/data/menus";
import type {
  Branch,
  BranchMenu,
  BranchSlug,
  MenuCategory,
  MenuChannel,
  OrderRecord,
  VisitRecord,
} from "@/lib/types";

const BRANCH_SLUGS: BranchSlug[] = ["nablus", "jenin"];
const MENU_CHANNELS: MenuChannel[] = ["inside", "outside"];

function isSlug(value: string): value is BranchSlug {
  return value === "nablus" || value === "jenin";
}

export function isMenuChannel(value: string): value is MenuChannel {
  return value === "inside" || value === "outside";
}

export function menuKeyFor(branchId: string, channel: MenuChannel) {
  return `${branchId}-${channel}`;
}

function asChannel(value: string | null | undefined): MenuChannel {
  return value === "inside" ? "inside" : "outside";
}

function fromSeed(slug: BranchSlug, channel: MenuChannel): BranchMenu {
  const seed = branchSeeds.find((branch) => branch.slug === slug);
  if (!seed) throw new Error("Unknown branch");
  const cats = channelMenus[channel];

  return {
    id: seed.id,
    slug: seed.slug,
    nameAr: seed.nameAr,
    nameEn: seed.nameEn,
    city: seed.city,
    address: seed.address,
    phone: seed.phone,
    whatsapp: seed.whatsapp,
    facebook: seed.facebook,
    instagram: seed.instagram,
    tiktok: seed.tiktok,
    heroImage: seed.heroImage,
    founded: seed.founded,
    sortOrder: 0,
    channel,
    menuKey: menuKeyFor(seed.id, channel),
    categories: cats.map((category, catIndex) => ({
      id: `${seed.id}-${channel}-${category.slug}`,
      branchId: seed.id,
      channel,
      nameAr: category.nameAr,
      slug: category.slug,
      note: category.note ?? null,
      sortOrder: catIndex,
      items: category.items.map((item, itemIndex) => ({
        id: `${seed.id}-${channel}-${category.slug}-${item.slug}`,
        branchId: seed.id,
        categoryId: `${seed.id}-${channel}-${category.slug}`,
        channel,
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        description: item.description ?? "",
        slug: item.slug,
        imageUrl: "",
        available: true,
        sortOrder: itemIndex,
        sizes: item.sizes.map((size, sizeIndex) => ({
          id: `${seed.id}-${channel}-${category.slug}-${item.slug}-${size.label}`,
          itemId: `${seed.id}-${channel}-${category.slug}-${item.slug}`,
          label: size.label,
          nameAr: size.nameAr,
          price: size.price,
          sortOrder: sizeIndex,
        })),
      })),
    })),
  };
}

function toBranch(row: typeof branches.$inferSelect): Branch | null {
  if (!isSlug(row.slug)) return null;
  return { ...row, slug: row.slug };
}

export async function listBranches(): Promise<Branch[]> {
  const db = getDb();
  if (!db) return listBranchesFallback();

  try {
    const rows = await db.select().from(branches);
    if (!rows.length) return listBranchesFallback();
    return rows
      .map(toBranch)
      .filter((row): row is Branch => Boolean(row))
      .sort((a, b) => a.sortOrder - b.sortOrder);
  } catch {
    return listBranchesFallback();
  }
}

function listBranchesFallback(): Branch[] {
  return branchSeeds.map((branch, index) => ({
    id: branch.id,
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
    sortOrder: index,
  }));
}

export async function getBranchMenu(
  slug: string,
  channel: MenuChannel = "outside",
): Promise<BranchMenu | null> {
  if (!isSlug(slug)) return null;
  const db = getDb();
  if (!db) return fromSeed(slug, channel);

  try {
    const [branch] = await db.select().from(branches).where(eq(branches.slug, slug));
    if (!branch || !isSlug(branch.slug)) return fromSeed(slug, channel);

    const cats = await db
      .select()
      .from(categories)
      .where(and(eq(categories.branchId, branch.id), eq(categories.channel, channel)));
    const items = await db
      .select()
      .from(menuItems)
      .where(and(eq(menuItems.branchId, branch.id), eq(menuItems.channel, channel)));
    const sizes = items.length ? await db.select().from(itemSizes) : [];

    const grouped: MenuCategory[] = cats
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((category) => ({
        ...category,
        channel: asChannel(category.channel),
        items: items
          .filter((item) => item.categoryId === category.id)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => ({
            ...item,
            channel: asChannel(item.channel),
            sizes: sizes
              .filter((size) => size.itemId === item.id)
              .sort((a, b) => a.sortOrder - b.sortOrder),
          })),
      }));

    if (!grouped.some((category) => category.items.length)) {
      return fromSeed(slug, channel);
    }

    return {
      ...branch,
      slug: branch.slug as BranchSlug,
      channel,
      menuKey: menuKeyFor(branch.id, channel),
      categories: grouped,
    };
  } catch {
    return fromSeed(slug, channel);
  }
}

export async function listScopedMenus(): Promise<BranchMenu[]> {
  const menus = await Promise.all(
    BRANCH_SLUGS.flatMap((slug) =>
      MENU_CHANNELS.map((channel) => getBranchMenu(slug, channel)),
    ),
  );
  return menus.filter((menu): menu is BranchMenu => Boolean(menu));
}

export async function getMenuItem(
  branchSlug: string,
  itemSlug: string,
  channel: MenuChannel = "outside",
) {
  const menu = await getBranchMenu(branchSlug, channel);
  if (!menu) return null;
  for (const category of menu.categories) {
    const item = category.items.find((entry) => entry.slug === itemSlug);
    if (item) return { branch: menu, category, item };
  }
  return null;
}

export async function listOrders(): Promise<OrderRecord[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db.select().from(orders);
    const lines = await db.select().from(orderItems);
    return rows
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .map((order) => ({
        ...order,
        items: lines
          .filter((line) => line.orderId === order.id)
          .map((line) => ({
            id: line.id,
            nameAr: line.nameAr,
            sizeLabel: line.sizeLabel,
            quantity: line.quantity,
            price: line.price,
          })),
      }));
  } catch {
    return [];
  }
}

export async function listVisits(): Promise<VisitRecord[]> {
  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db.select().from(visits);
    return rows.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    return [];
  }
}
