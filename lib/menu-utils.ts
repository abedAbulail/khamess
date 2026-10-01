import type { MenuItem } from "@/lib/types";

export function lowestPrice(item: MenuItem) {
  return Math.min(...item.sizes.map((size) => size.price));
}

export function priceLabel(item: MenuItem) {
  const prices = item.sizes.map((size) => size.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `${min} ₪`;
  return `من ${min} ₪`;
}

export function hasItemImage(url?: string | null) {
  return Boolean(url?.trim());
}
