"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

export function EditorPage({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="-mx-4 min-h-[calc(100svh-5.5rem)] bg-[var(--admin-bg)] pb-28 sm:-mx-6 lg:-mx-8 lg:min-h-svh">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-start justify-between gap-4 border-b border-[var(--admin-border)] pb-6">
          <div>
            {subtitle ? (
              <p className="text-[12px] text-[var(--admin-muted)]">{subtitle}</p>
            ) : null}
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-card)] text-[var(--admin-muted)] transition hover:border-[var(--admin-text)] hover:text-[var(--admin-text)]"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
