"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { getCartCount, getCartSubtotal, useCartStore } from "@/lib/cart";
import { formatPrice } from "@/lib/cn";

export function useHydratedCart() {
  const [ready, setReady] = useState(false);
  const items = useCartStore((state) => state.items);

  useEffect(() => {
    void useCartStore.persist.rehydrate();
    setReady(true);
  }, []);

  return { ready, items };
}

export function CartBar({
  branchId,
  href,
}: {
  branchId: string;
  href: string;
}) {
  const { ready, items } = useHydratedCart();
  const count = getCartCount(items, branchId);
  const total = getCartSubtotal(items, branchId);

  if (!ready || count === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 p-4">
      <Link
        href={href}
        className="mx-auto flex min-h-14 max-w-6xl items-center justify-between bg-gold px-5 text-black shadow-xl"
      >
        <span className="flex items-center gap-2 font-bold">
          <ShoppingBag className="size-5" />
          السلة · {count}
        </span>
        <span className="tabular-nums">{formatPrice(total)}</span>
      </Link>
    </div>
  );
}
