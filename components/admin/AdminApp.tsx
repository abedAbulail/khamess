"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import type { AdminActor } from "@/lib/admin-pages";

export type AdminTheme = "light" | "dark";

const STORAGE_KEY = "khamis-admin-theme";

export function AdminApp({
  authed,
  actor,
  children,
}: {
  authed: boolean;
  actor: AdminActor | null;
  children: ReactNode;
}) {
  const [theme, setTheme] = useState<AdminTheme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <div className="admin-root" data-theme={theme}>
      {authed && actor ? (
        <AdminShell theme={theme} onToggleTheme={toggleTheme} actor={actor}>
          {children}
        </AdminShell>
      ) : (
        children
      )}
    </div>
  );
}
