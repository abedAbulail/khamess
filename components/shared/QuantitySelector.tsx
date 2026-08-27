"use client";

import { Minus, Plus } from "lucide-react";

export function QuantitySelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="inline-flex items-center border border-line">
      <button
        type="button"
        aria-label="تقليل الكمية"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="grid size-11 place-items-center text-gold"
      >
        <Minus className="size-4" />
      </button>
      <span className="min-w-8 text-center text-[15px] tabular-nums">{value}</span>
      <button
        type="button"
        aria-label="زيادة الكمية"
        onClick={() => onChange(value + 1)}
        className="grid size-11 place-items-center text-gold"
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
