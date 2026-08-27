"use client";

import { ChevronLeft } from "lucide-react";
import { cn, formatPrice } from "@/lib/cn";
import type { Branch, OrderRecord } from "@/lib/types";

export function statsForBranches(orders: OrderRecord[]) {
  const stats: Record<string, { orders: number; revenue: number }> = {};
  for (const order of orders) {
    const current = stats[order.branchId] ?? { orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += order.subtotal;
    stats[order.branchId] = current;
  }
  return stats;
}

export function BranchCard({
  branch,
  orders = 0,
  revenue = 0,
  active = false,
  onClick,
}: {
  branch: Branch;
  orders?: number;
  revenue?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "admin-card flex w-full items-center justify-between p-5 text-right transition",
        active
          ? "border-[var(--admin-accent)] ring-1 ring-[var(--admin-accent)]"
          : "hover:border-[var(--admin-accent)]",
      )}
    >
      <div>
        <p className="text-[13px] text-[var(--admin-muted)]">{branch.city}</p>
        <h3 className="mt-1 text-lg font-semibold">{branch.nameAr}</h3>
        <p className="mt-2 text-[14px] text-[var(--admin-muted)]">
          {orders} طلب · {formatPrice(revenue)}
        </p>
      </div>
      <ChevronLeft className="size-5 shrink-0 text-[var(--admin-muted)]" />
    </button>
  );
}
