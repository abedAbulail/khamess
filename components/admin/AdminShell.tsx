"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Activity,
  FolderTree,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  QrCode,
  Settings,
  ShoppingBag,
  Sun,
  UserCog,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { AdminTheme } from "@/components/admin/AdminApp";
import { cn } from "@/lib/cn";
import {
  STAFF_PAGES,
  SUPER_PAGES,
  canAccessPage,
  isFullAdmin,
  roleLabel,
  type AdminActor,
  type AdminPageId,
} from "@/lib/admin-pages";

const ICONS = {
  dashboard: LayoutDashboard,
  categories: FolderTree,
  items: UtensilsCrossed,
  orders: ShoppingBag,
  visitors: Users,
  qr: QrCode,
  settings: Settings,
  users: UserCog,
  monitor: Activity,
} as const;

export function AdminShell({
  children,
  theme,
  onToggleTheme,
  actor,
}: {
  children: ReactNode;
  theme: AdminTheme;
  onToggleTheme: () => void;
  actor: AdminActor;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const items = [
    ...STAFF_PAGES.filter((item) => canAccessPage(actor, item.id)),
    ...(isFullAdmin(actor) ? SUPER_PAGES : []),
  ];

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-svh">
      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-40 flex h-svh w-64 flex-col overflow-hidden border-l border-[var(--admin-border)] bg-[var(--admin-sidebar)] transition-transform",
          open ? "translate-x-0" : "translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-5">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="مطعم خميس" className="size-9 object-contain" />
            <div>
              <p className="text-[14px] font-semibold">مطعم خميس</p>
              <p className="text-[11px] text-[var(--admin-muted)]">لوحة التحكم</p>
            </div>
          </div>
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {items.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = ICONS[item.id as AdminPageId];
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px]",
                  active
                    ? "bg-[var(--admin-hover)] font-medium text-[var(--admin-text)]"
                    : "text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-[var(--admin-border)] p-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
          </button>
          <div className="flex items-center justify-between rounded-xl px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{actor.displayName}</p>
              <p className="text-[11px] text-[var(--admin-muted)]">
                {roleLabel(actor.role)} · {actor.username}
              </p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="grid size-9 place-items-center rounded-lg text-[var(--admin-muted)] hover:bg-[var(--admin-hover)] hover:text-[var(--admin-text)]"
              aria-label="خروج"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="إغلاق"
        />
      ) : null}

      <div className="flex min-h-svh min-w-0 flex-col lg:ms-64">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--admin-border)] bg-[var(--admin-bg)]/90 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-10 place-items-center rounded-xl border border-[var(--admin-border)]"
            aria-label="القائمة"
          >
            <Menu className="size-4" />
          </button>
          <p className="text-[14px] font-semibold">لوحة خميس</p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="grid size-10 place-items-center rounded-xl border border-[var(--admin-border)]"
            aria-label="تغيير المظهر"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </header>
        <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}
