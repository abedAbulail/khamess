"use client";

import { useMemo, useState } from "react";
import type { VisitRecord } from "@/lib/types";

const DAYS = 14;

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function asDate(value: Date | string) {
  return typeof value === "string" ? new Date(value) : value;
}

export function visitorsByDay(visits: VisitRecord[], days = DAYS) {
  const today = startOfDay(new Date());
  const points = Array.from({ length: days }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - index));
    return { date, key: dayKey(date), count: 0 };
  });
  const index = new Map(points.map((point, i) => [point.key, i]));
  for (const visit of visits) {
    const slot = index.get(dayKey(startOfDay(asDate(visit.createdAt))));
    if (slot == null) continue;
    const point = points[slot];
    if (point) point.count += 1;
  }
  return points;
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    if (!p0 || !p1 || !p2 || !p3) continue;
    path += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export function VisitorsChart({ visits }: { visits: VisitRecord[] }) {
  const [active, setActive] = useState<number | null>(null);
  const series = useMemo(() => visitorsByDay(visits), [visits]);
  const width = 920;
  const height = 240;
  const pad = { top: 18, right: 16, bottom: 32, left: 36 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...series.map((point) => point.count));
  const coords = series.map((point, index) => ({
    ...point,
    x: pad.left + (series.length === 1 ? innerW / 2 : (index / (series.length - 1)) * innerW),
    y: pad.top + innerH - (point.count / max) * innerH,
  }));
  const line = smoothPath(coords);
  const area = `${line} L ${coords.at(-1)?.x ?? pad.left} ${pad.top + innerH} L ${coords[0]?.x ?? pad.left} ${pad.top + innerH} Z`;
  const hovered = active == null ? null : coords[active];
  const total = series.reduce((sum, point) => sum + point.count, 0);

  return (
    <section className="admin-card overflow-hidden">
      <div className="flex items-end justify-between gap-4 border-b border-[var(--admin-border)] px-5 py-4">
        <div>
          <p className="text-[11px] text-[var(--admin-muted)]">آخر 14 يوم</p>
          <h2 className="text-lg font-semibold">حركة الزوار</h2>
        </div>
        <p className="text-[13px] text-[var(--admin-muted)]">{total} زيارة</p>
      </div>
      <div className="px-2 pb-3 pt-2 sm:px-4">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="h-[220px] w-full"
          onMouseLeave={() => setActive(null)}
        >
          <path d={area} fill="color-mix(in srgb, var(--admin-accent) 16%, transparent)" />
          <path
            d={line}
            fill="none"
            stroke="var(--admin-accent)"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
          {coords.map((point, index) => (
            <rect
              key={point.key}
              x={point.x - innerW / series.length / 2}
              y={pad.top}
              width={innerW / series.length}
              height={innerH}
              fill="transparent"
              onMouseEnter={() => setActive(index)}
            />
          ))}
          {hovered ? <circle cx={hovered.x} cy={hovered.y} r="5" fill="var(--admin-accent)" /> : null}
          {coords.map((point, index) =>
            index % 2 === 0 || index === coords.length - 1 ? (
              <text
                key={point.key}
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                fontSize="11"
                fill="var(--admin-muted)"
              >
                {new Intl.DateTimeFormat("ar-PS", { day: "numeric", month: "short" }).format(point.date)}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </section>
  );
}
