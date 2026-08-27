"use client";

import type { ReactNode } from "react";
import { BranchCard, statsForBranches } from "@/components/admin/BranchCard";
import type { Branch, OrderRecord } from "@/lib/types";

export function BranchGate({
  title,
  hint,
  branches,
  orders = [],
  selectedId,
  onSelect,
  children,
}: {
  title: string;
  hint: string;
  branches: Branch[];
  orders?: OrderRecord[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const selected = branches.find((branch) => branch.id === selectedId);
  const stats = statsForBranches(orders);

  const cards = (
    <div className="grid gap-3 sm:grid-cols-2">
      {branches.map((branch) => (
        <BranchCard
          key={branch.id}
          branch={branch}
          active={branch.id === selectedId}
          orders={stats[branch.id]?.orders ?? 0}
          revenue={stats[branch.id]?.revenue ?? 0}
          onClick={() => onSelect(branch.id)}
        />
      ))}
    </div>
  );

  if (!selected) {
    return (
      <div>
        <p className="text-[12px] tracking-[0.25em] text-[var(--admin-muted)]">مطعم خميس</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-[15px] text-[var(--admin-muted)]">
          أولاً اختر الفرع — نابلس أو جنين.
        </p>
        <div className="mt-8">{cards}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-[12px] text-[var(--admin-muted)]">{selected.nameAr}</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-[14px] text-[var(--admin-muted)]">{hint}</p>
        <div className="mt-4">{cards}</div>
      </div>
      {children}
    </div>
  );
}
