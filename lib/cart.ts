import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine, MenuItem } from "@/lib/types";

type CartState = {
  items: CartLine[];
  addItem: (item: MenuItem, sizeId: string, quantity: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clearBranch: (branchId: string) => void;
  clearCart: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, sizeId, quantity) => {
        const size = item.sizes.find((entry) => entry.id === sizeId);
        if (!size) return;
        const key = `${item.id}:${size.id}`;
        const existing = get().items.find((line) => line.key === key);
        if (existing) {
          set({
            items: get().items.map((line) =>
              line.key === key
                ? { ...line, quantity: line.quantity + quantity }
                : line,
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              key,
              itemId: item.id,
              branchId: item.branchId,
              slug: item.slug,
              nameAr: item.nameAr,
              imageUrl: item.imageUrl,
              sizeId: size.id,
              sizeLabel: size.label,
              sizeNameAr: size.nameAr,
              price: size.price,
              quantity,
            },
          ],
        });
      },
      removeItem: (key) => {
        set({ items: get().items.filter((line) => line.key !== key) });
      },
      setQuantity: (key, quantity) => {
        if (quantity < 1) {
          set({ items: get().items.filter((line) => line.key !== key) });
          return;
        }
        set({
          items: get().items.map((line) =>
            line.key === key ? { ...line, quantity } : line,
          ),
        });
      },
      clearBranch: (branchId) => {
        set({
          items: get().items.filter((line) => line.branchId !== branchId),
        });
      },
      clearCart: () => set({ items: [] }),
    }),
    { name: "khamis-cart", skipHydration: true },
  ),
);

export function getCartCount(items: CartLine[], branchId?: string) {
  return items
    .filter((line) => !branchId || line.branchId === branchId)
    .reduce((sum, line) => sum + line.quantity, 0);
}

export function getCartSubtotal(items: CartLine[], branchId?: string) {
  return items
    .filter((line) => !branchId || line.branchId === branchId)
    .reduce((sum, line) => sum + line.price * line.quantity, 0);
}
