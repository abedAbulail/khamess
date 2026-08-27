"use client";

import { useMemo, useState } from "react";
import { ACTION_LABELS, PAGE_LABELS, roleLabel } from "@/lib/admin-pages";
import type { AdminUserRow } from "@/components/admin/UsersPanel";

type ActivityRow = {
  id: string;
  userId: string;
  username: string;
  role: string;
  action: string;
  page: string;
  detail: string;
  createdAt: Date | string;
};

function formatWhen(value: Date | string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MonitorPanel({
  users,
  activity,
}: {
  users: AdminUserRow[];
  activity: ActivityRow[];
}) {
  const [userId, setUserId] = useState("all");
  const filtered = useMemo(
    () => (userId === "all" ? activity : activity.filter((row) => row.userId === userId)),
    [activity, userId],
  );

  return (
    <div>
      <p className="text-[12px] tracking-[0.25em] text-[var(--admin-muted)]">مطعم خميس</p>
      <h1 className="mt-2 text-3xl font-semibold">المراقبة</h1>
      <p className="mt-2 text-[15px] text-[var(--admin-muted)]">
        تتبع دخول المستخدمين وآخر ظهور وكل تعديل عملوه.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {users.map((user) => (
          <article key={user.id} className="admin-card p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{user.displayName}</h2>
              <span className="text-[12px] text-[var(--admin-muted)]">{roleLabel(user.role)}</span>
            </div>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]" dir="ltr">
              @{user.username}
            </p>
            <p className="mt-3 text-[13px] text-[var(--admin-muted)]">آخر دخول: {formatWhen(user.lastLoginAt)}</p>
            <p className="text-[13px] text-[var(--admin-muted)]">آخر ظهور: {formatWhen(user.lastSeenAt)}</p>
            <p className="mt-2 text-[12px] text-[var(--admin-muted)]">
              {user.active ? "نشط" : "موقوف"} · {user.pages.length ? user.pages.length : "كل"} صفحات
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold">سجل النشاط</h2>
        <select
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          className="admin-input h-11 w-full max-w-xs"
        >
          <option value="all">كل المستخدمين</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.displayName}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-card mt-4 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-[var(--admin-muted)]">ما في نشاط بعد.</p>
        ) : (
          <table className="w-full min-w-[760px] text-right text-[13px]">
            <thead className="border-b border-[var(--admin-border)] text-[var(--admin-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">الوقت</th>
                <th className="px-4 py-3 font-medium">المستخدم</th>
                <th className="px-4 py-3 font-medium">الإجراء</th>
                <th className="px-4 py-3 font-medium">الصفحة</th>
                <th className="px-4 py-3 font-medium">التفاصيل</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-[var(--admin-border)] last:border-0">
                  <td className="px-4 py-3">{formatWhen(row.createdAt)}</td>
                  <td className="px-4 py-3">{row.username}</td>
                  <td className="px-4 py-3">{ACTION_LABELS[row.action] ?? row.action}</td>
                  <td className="px-4 py-3">{PAGE_LABELS[row.page] ?? row.page ?? "—"}</td>
                  <td className="px-4 py-3 text-[var(--admin-muted)]">{row.detail || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
