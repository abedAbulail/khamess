import type { BranchMenu, MenuCategory, MenuChannel, MenuItem } from "@/lib/types";

export type ItemCopy = {
  item: MenuItem;
  category: MenuCategory;
  branchId: string;
  branchName: string;
  channel: MenuChannel;
};

export type ItemGroup = {
  slug: string;
  nameAr: string;
  nameEn: string;
  description: string;
  imageUrl: string;
  available: boolean;
  copies: ItemCopy[];
};

export function groupMenuItems(menus: BranchMenu[]): ItemGroup[] {
  const groups = new Map<string, ItemGroup>();

  for (const menu of menus) {
    for (const category of menu.categories) {
      for (const item of category.items) {
        const current = groups.get(item.slug);
        const copy: ItemCopy = {
          item,
          category,
          branchId: menu.id,
          branchName: menu.city,
          channel: menu.channel,
        };
        if (!current) {
          groups.set(item.slug, {
            slug: item.slug,
            nameAr: item.nameAr,
            nameEn: item.nameEn,
            description: item.description,
            imageUrl: item.imageUrl,
            available: item.available,
            copies: [copy],
          });
          continue;
        }
        current.copies.push(copy);
        if (!current.imageUrl && item.imageUrl) current.imageUrl = item.imageUrl;
        if (!current.nameEn && item.nameEn) current.nameEn = item.nameEn;
        if (!current.description && item.description) current.description = item.description;
        current.available = current.available && item.available;
      }
    }
  }

  return [...groups.values()].sort((a, b) => a.nameAr.localeCompare(b.nameAr, "ar"));
}

export function channelsOf(group: ItemGroup): MenuChannel[] {
  return [...new Set(group.copies.map((copy) => copy.channel))];
}

export function copyForChannel(group: ItemGroup, channel: MenuChannel) {
  return group.copies.find((copy) => copy.channel === channel) ?? null;
}

export function categoriesForChannel(menus: BranchMenu[], channel: MenuChannel) {
  const seen = new Set<string>();
  const list: MenuCategory[] = [];
  for (const menu of menus) {
    if (menu.channel !== channel) continue;
    for (const category of menu.categories) {
      if (seen.has(category.slug)) continue;
      seen.add(category.slug);
      list.push(category);
    }
  }
  return list;
}
