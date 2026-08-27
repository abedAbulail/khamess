"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BranchGate } from "@/components/admin/BranchGate";
import { formatPrice } from "@/lib/cn";
import type { Branch, OrderRecord } from "@/lib/types";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function OrdersPanel({
  orders,
  branches,
  initialBranch,
}: {
  orders: OrderRecord[];
  branches: Branch[];
  initialBranch: string | null;
}) {
  const router = useRouter();
  const [branchId, setBranchId] = useState<string | null>(initialBranch);
  const filtered = useMemo(
    () => (branchId ? orders.filter((order) => order.branchId === branchId) : []),
    [orders, branchId],
  );

  function selectBranch(id: string) {
    setBranchId(id);
    router.replace(`/admin/orders?branch=${id}`, { scroll: false });
  }

  return (
    <BranchGate
      title="الطلبات"
      hint="تابع طلبات الفرع وحدّث حالتها."
      branches={branches}
      orders={orders}
      selectedId={branchId}
      onSelect={selectBranch}
    >
      <OrderList orders={filtered} branches={branches} />
    </BranchGate>
  );
}

function OrderList({
  orders,
  branches,
}: {
  orders: OrderRecord[];
  branches: Branch[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "order-status", id, status }),
    });
    setBusy(null);
    router.refresh();
  }

  if (orders.length === 0) {
    return (
      <p className="admin-card p-8 text-center text-[var(--admin-muted)]">ما في طلبات لهذا الفرع بعد.</p>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const branch = branches.find((entry) => entry.id === order.branchId);
        const message = [
          `طلب ${order.id.slice(-6)}`,
          `الاسم: ${order.customerName}`,
          `الهاتف: ${order.phone}`,
          ...order.items.map(
            (item) => `• ${item.nameAr} ${item.sizeLabel} × ${item.quantity}`,
          ),
          `المجموع: ${order.subtotal} ₪`,
        ].join("\n");
        return (
          <article key={order.id} className="admin-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{order.customerName}</p>
                <p className="text-[13px] text-[var(--admin-muted)]" dir="ltr">
                  {order.phone}
                </p>
                <p className="mt-1 text-[12px] text-[var(--admin-muted)]">
                  {new Intl.DateTimeFormat("ar-PS", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(order.createdAt))}
                </p>
              </div>
              <p className="text-lg font-semibold">{formatPrice(order.subtotal)}</p>
            </div>
            <ul className="mt-3 text-[14px] text-[var(--admin-muted)]">
              {order.items.map((item) => (
                <li key={item.id}>
                  {item.nameAr} {item.sizeLabel} × {item.quantity} — {formatPrice(item.price * item.quantity)}
                </li>
              ))}
            </ul>
            {order.notes ? (
              <p className="mt-2 text-[13px] text-[var(--admin-muted)]">ملاحظات: {order.notes}</p>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {["new", "preparing", "done"].map((status) => (
                <button
                  key={status}
                  type="button"
                  disabled={busy === order.id}
                  onClick={() => void setStatus(order.id, status)}
                  className={`rounded-full px-3 py-1 text-[13px] ${
                    order.status === status
                      ? "bg-[var(--admin-accent)] text-[var(--admin-accent-text)]"
                      : "border border-[var(--admin-border)]"
                  }`}
                >
                  {status === "new" ? "جديد" : status === "preparing" ? "قيد التحضير" : "تم"}
                </button>
              ))}
              {branch ? (
                <a
                  href={getWhatsAppUrl(
                    order.phone.startsWith("05") ? `970${order.phone.slice(1)}` : branch.whatsapp,
                    message,
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-[var(--admin-accent)] px-3 py-1 text-[13px] text-[var(--admin-accent-text)]"
                >
                  واتساب
                </a>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
