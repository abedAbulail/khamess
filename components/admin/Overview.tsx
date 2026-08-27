"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BranchCard } from "@/components/admin/BranchCard";
import { VisitorsChart, visitorsByDay } from "@/components/admin/VisitorsChart";
import { formatPrice } from "@/lib/cn";
import type { Branch, OrderRecord, VisitRecord } from "@/lib/types";

const RANGES = [
  { id: "24h", label: "24س" },
  { id: "7d", label: "7 أيام" },
  { id: "14d", label: "14 يوم" },
  { id: "30d", label: "30 يوم" },
] as const;

type RangeId = (typeof RANGES)[number]["id"];

function since(range: RangeId) {
  const date = new Date();
  if (range === "24h") date.setHours(date.getHours() - 24);
  else date.setDate(date.getDate() - Number(range.replace("d", "")));
  return date;
}

function inRange(value: Date | string, start: Date) {
  return new Date(value).getTime() >= start.getTime();
}

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const width = 220;
  const height = 56;
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => {
    const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
    const y = height - (value / max) * (height - 8) - 4;
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-4 h-14 w-full">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points.join(" ")}
      />
    </svg>
  );
}

export function Overview({
  visits,
  orders,
  branches,
  databaseReady,
  canOpenOrders = true,
  canOpenItems = true,
}: {
  visits: VisitRecord[];
  orders: OrderRecord[];
  branches: Branch[];
  databaseReady: boolean;
  canOpenOrders?: boolean;
  canOpenItems?: boolean;
}) {
  const [range, setRange] = useState<RangeId>("7d");
  const router = useRouter();
  const start = since(range);
  const rangedVisits = visits.filter((visit) => inRange(visit.createdAt, start));
  const rangedOrders = orders.filter((order) => inRange(order.createdAt, start));
  const revenue = rangedOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const newOrders = rangedOrders.filter((order) => order.status === "new").length;
  const popular = useMemo(() => {
    const counts = new Map<string, number>();
    for (const order of rangedOrders) {
      for (const item of order.items) {
        counts.set(item.nameAr, (counts.get(item.nameAr) ?? 0) + item.quantity);
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  }, [rangedOrders]);
  const visitSeries = visitorsByDay(rangedVisits, range === "24h" ? 7 : Number(range.replace("d", "")) || 7).map(
    (point) => point.count,
  );
  const orderSeries = visitorsByDay(
    rangedOrders.map((order) => ({
      id: order.id,
      branchId: order.branchId,
      page: "order",
      source: order.source,
      createdAt: order.createdAt,
    })),
    range === "24h" ? 7 : Number(range.replace("d", "")) || 7,
  ).map((point) => point.count);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] tracking-[0.25em] text-[var(--admin-muted)]">لوحة التحكم</p>
          <h1 className="mt-1 text-3xl font-semibold">الرئيسية</h1>
        </div>
        <div className="flex rounded-xl border border-[var(--admin-border)] p-1">
          {RANGES.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => setRange(entry.id)}
              className={`rounded-lg px-3 py-1.5 text-[13px] ${
                range === entry.id
                  ? "bg-[var(--admin-hover)] font-medium"
                  : "text-[var(--admin-muted)]"
              }`}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      {!databaseReady ? (
        <p className="admin-card mt-6 px-4 py-3 text-[14px] text-[var(--admin-muted)]">
          قاعدة البيانات مش متصلة — الزيارات والطلبات ما رح تنحفظ.
        </p>
      ) : null}

      <section className="admin-card relative mt-6 overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(230,145,16,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-lg">
            <p className="text-[12px] text-[var(--admin-accent)]">مطعم خميس · منذ 1968</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">إدارة المنيو والطلبات من مكان واحد</h2>
            <p className="mt-2 text-[14px] leading-7 text-[var(--admin-muted)]">
              اختر الفرع من صفحات التصنيفات أو الأصناف أو الطلبات، وعدّل الأسعار والصور مباشرة.
            </p>
            {canOpenItems ? (
              <Link href="/admin/items" className="admin-btn admin-btn-primary mt-5 inline-flex items-center">
                فتح الأصناف
              </Link>
            ) : canOpenOrders ? (
              <Link href="/admin/orders" className="admin-btn admin-btn-primary mt-5 inline-flex items-center">
                فتح الطلبات
              </Link>
            ) : null}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="مطعم خميس" className="relative h-28 w-auto object-contain" />
        </div>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="admin-card p-5">
          <p className="text-[13px] text-[var(--admin-muted)]">الطلبات</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{rangedOrders.length}</p>
          <Sparkline values={orderSeries} color="var(--admin-accent)" />
        </article>
        <article className="admin-card p-5">
          <p className="text-[13px] text-[var(--admin-muted)]">المبيعات</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{formatPrice(revenue)}</p>
          <p className="mt-4 text-[13px] text-[var(--admin-muted)]">{newOrders} طلب جديد</p>
        </article>
        <article className="admin-card p-5">
          <p className="text-[13px] text-[var(--admin-muted)]">الزوار</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums">{rangedVisits.length}</p>
          <Sparkline values={visitSeries} color="var(--admin-chart)" />
        </article>
        <article className="admin-card p-5">
          <p className="text-[13px] text-[var(--admin-muted)]">الأكثر طلباً</p>
          <p className="mt-2 text-2xl font-semibold">{popular}</p>
          <p className="mt-4 text-[13px] text-[var(--admin-muted)]">حسب كمية الأصناف</p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {branches.map((branch) => {
          const count = rangedOrders.filter((order) => order.branchId === branch.id).length;
          const sum = rangedOrders
            .filter((order) => order.branchId === branch.id)
            .reduce((total, order) => total + order.subtotal, 0);
          return (
            <BranchCard
              key={branch.id}
              branch={branch}
              orders={count}
              revenue={sum}
              onClick={
                canOpenOrders ? () => router.push(`/admin/orders?branch=${branch.id}`) : undefined
              }
            />
          );
        })}
      </div>

      <div className="mt-6">
        <VisitorsChart visits={visits} />
      </div>
    </div>
  );
}
