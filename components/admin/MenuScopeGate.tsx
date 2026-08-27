"use client";

import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";
import type { BranchMenu, MenuChannel } from "@/lib/types";

function channelLabel(channel: MenuChannel) {
  return channel === "inside" ? "داخل" : "خارج";
}

function channelHint(channel: MenuChannel) {
  return channel === "inside" ? "منيو الطاولات — عرض فقط" : "منيو الطلبات — للزبون أونلاين";
}

export function scopeTitle(menu: BranchMenu) {
  return `${menu.city} — ${channelLabel(menu.channel)}`;
}

export function MenuScopeGate({
  title,
  hint,
  menus,
  selectedKey,
  onSelect,
  children,
}: {
  title: string;
  hint: string;
  menus: BranchMenu[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  children: ReactNode;
}) {
  const selected = menus.find((menu) => menu.menuKey === selectedKey);

  const cards = (
    <div className="grid gap-3 sm:grid-cols-2">
      {menus.map((menu) => {
        const active = menu.menuKey === selectedKey;
        return (
          <button
            key={menu.menuKey}
            type="button"
            onClick={() => onSelect(menu.menuKey)}
            className={cn(
              "admin-card flex w-full items-center justify-between p-5 text-right transition",
              active
                ? "border-[var(--admin-accent)] ring-1 ring-[var(--admin-accent)]"
                : "hover:border-[var(--admin-accent)]",
            )}
          >
            <div>
              <p className="text-[13px] text-[var(--admin-muted)]">{menu.city}</p>
              <h3 className="mt-1 text-lg font-semibold">{scopeTitle(menu)}</h3>
              <p className="mt-2 text-[14px] text-[var(--admin-muted)]">
                {channelHint(menu.channel)}
              </p>
            </div>
            <ChevronLeft className="size-5 shrink-0 text-[var(--admin-muted)]" />
          </button>
        );
      })}
    </div>
  );

  if (!selected) {
    return (
      <div>
        <p className="text-[12px] tracking-[0.25em] text-[var(--admin-muted)]">مطعم خميس</p>
        <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-[15px] text-[var(--admin-muted)]">
          اختر الفرع والقائمة — داخل المطعم أو خارجه.
        </p>
        <div className="mt-8">{cards}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-[12px] text-[var(--admin-muted)]">{scopeTitle(selected)}</p>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-1 text-[14px] text-[var(--admin-muted)]">{hint}</p>
        <div className="mt-4">{cards}</div>
      </div>
      {children}
    </div>
  );
}
