"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus } from "lucide-react";
import { EditorPage } from "@/components/admin/EditorPage";
import { cn } from "@/lib/cn";
import {
  STAFF_PAGES,
  roleLabel,
  type AdminActor,
  type AdminBranchId,
  type AdminRole,
  type StaffPageId,
} from "@/lib/admin-pages";

export type AdminUserRow = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  pages: StaffPageId[];
  branches: readonly AdminBranchId[];
  active: boolean;
  createdAt: Date | string;
  lastLoginAt: Date | string | null;
  lastSeenAt: Date | string | null;
};

const BRANCH_OPTIONS: Array<{ id: AdminBranchId; label: string }> = [
  { id: "nablus", label: "نابلس" },
  { id: "jenin", label: "جنين" },
];

function formatWhen(value: Date | string | null) {
  if (!value) return "لم يدخل بعد";
  return new Intl.DateTimeFormat("ar-PS", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function UsersPanel({
  users,
  actor,
}: {
  users: AdminUserRow[];
  actor: AdminActor;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<AdminUserRow | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(payload: {
    displayName: string;
    username: string;
    password: string;
    pages: StaffPageId[];
    branches: AdminBranchId[];
    role: AdminRole;
    active: boolean;
  }) {
    setSaving(true);
    setError("");
    const response = await fetch("/api/admin/users", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        editing
          ? {
              id: editing.id,
              displayName: payload.displayName,
              password: payload.password,
              pages: payload.pages,
              branches: payload.branches,
              role: payload.role,
              active: payload.active,
            }
          : payload,
      ),
    });
    setSaving(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(
        body?.error === "Username taken"
          ? "اسم المستخدم مستخدم"
          : body?.error === "Missing access"
            ? "اختر صفحة وفرع على الأقل"
            : "ما قدرناش نحفظ. تأكد من الاسم وكلمة السر (6 أحرف).",
      );
      return;
    }
    setEditing(undefined);
    router.refresh();
  }

  if (editing !== undefined) {
    return (
      <EditorPage
        title={editing ? "تعديل مستخدم" : "مستخدم جديد"}
        subtitle="صلاحيات الصفحات والفروع"
        onClose={() => {
          setEditing(undefined);
          setError("");
        }}
      >
        <UserForm
          key={editing?.id ?? "new"}
          user={editing}
          actor={actor}
          saving={saving}
          error={error}
          onClose={() => {
            setEditing(undefined);
            setError("");
          }}
          onSave={save}
        />
      </EditorPage>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[12px] tracking-[0.25em] text-[var(--admin-muted)]">مطعم خميس</p>
          <h1 className="mt-2 text-3xl font-semibold">المستخدمون</h1>
          <p className="mt-2 text-[15px] text-[var(--admin-muted)]">
            أنشئ حسابات وحدد الصفحات والفروع اللي يقدروا يشوفوها.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="admin-btn admin-btn-primary inline-flex items-center gap-2"
        >
          <Plus className="size-4" />
          مستخدم جديد
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {users.length === 0 ? (
          <p className="admin-card p-8 text-center text-[var(--admin-muted)]">ما في مستخدمين بعد.</p>
        ) : (
          users.map((user) => (
            <article key={user.id} className="admin-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{user.displayName}</p>
                  <span className="rounded-lg border border-[var(--admin-border)] px-2 py-0.5 text-[12px] text-[var(--admin-muted)]">
                    {roleLabel(user.role)}
                  </span>
                  <span
                    className={cn(
                      "rounded-lg px-2 py-0.5 text-[12px]",
                      user.active
                        ? "bg-[var(--admin-accent)] text-[var(--admin-accent-text)]"
                        : "border border-[var(--admin-border)] text-[var(--admin-muted)]",
                    )}
                  >
                    {user.active ? "نشط" : "موقوف"}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-[var(--admin-muted)]" dir="ltr">
                  @{user.username}
                </p>
                <p className="mt-2 text-[13px] text-[var(--admin-muted)]">
                  {user.role === "staff"
                    ? `${user.branches.map((id) => (id === "nablus" ? "نابلس" : "جنين")).join(" · ")} — ${user.pages
                        .map((id) => STAFF_PAGES.find((page) => page.id === id)?.label)
                        .filter(Boolean)
                        .join("، ")}`
                    : "كل الصفحات وكل الفروع"}
                </p>
                <p className="mt-1 text-[12px] text-[var(--admin-muted)]">
                  آخر دخول: {formatWhen(user.lastLoginAt)} · آخر ظهور: {formatWhen(user.lastSeenAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(user)}
                className="admin-btn admin-btn-ghost inline-flex items-center gap-1"
              >
                <Pencil className="size-3.5" />
                تعديل
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
}

function UserForm({
  user,
  actor,
  saving,
  error,
  onClose,
  onSave,
}: {
  user: AdminUserRow | null;
  actor: AdminActor;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSave: (payload: {
    displayName: string;
    username: string;
    password: string;
    pages: StaffPageId[];
    branches: AdminBranchId[];
    role: AdminRole;
    active: boolean;
  }) => void;
}) {
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [password, setPassword] = useState("");
  const [pages, setPages] = useState<StaffPageId[]>(user?.pages ?? ["orders"]);
  const [branches, setBranches] = useState<AdminBranchId[]>(
    user?.branches?.length ? [...user.branches] : ["nablus"],
  );
  const [role, setRole] = useState<AdminRole>(user?.role ?? "staff");
  const [active, setActive] = useState(user?.active ?? true);
  const isStaff = role === "staff";
  const canPickRole = actor.role === "dev" && user?.role !== "dev";

  const selectedPages = useMemo(() => new Set(pages), [pages]);
  const selectedBranches = useMemo(() => new Set(branches), [branches]);

  function togglePage(id: StaffPageId) {
    setPages((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }

  function toggleBranch(id: AdminBranchId) {
    setBranches((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  }

  return (
    <form
      className="mx-auto max-w-2xl"
      onSubmit={(event) => {
        event.preventDefault();
        onSave({
          displayName: displayName.trim() || username.trim(),
          username: username.trim(),
          password,
          pages,
          branches,
          role,
          active,
        });
      }}
    >
      <section className="admin-card space-y-5 p-6">
        <h2 className="text-lg font-semibold">الحساب</h2>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[var(--admin-muted)]">الاسم</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            className="admin-input h-12"
            placeholder="مثال: مدير نابلس"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[var(--admin-muted)]">اسم المستخدم</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="admin-input h-12"
            dir="ltr"
            required={!user}
            disabled={Boolean(user)}
            placeholder="nablus.admin"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-[13px] font-medium text-[var(--admin-muted)]">
            {user ? "كلمة سر جديدة (اختياري)" : "كلمة السر"}
          </span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="admin-input h-12"
            required={!user}
            minLength={user ? undefined : 6}
            placeholder={user ? "اتركها فارغة للإبقاء على الحالية" : "٦ أحرف على الأقل"}
          />
        </label>
        {canPickRole ? (
          <label className="block">
            <span className="mb-2 block text-[13px] font-medium text-[var(--admin-muted)]">الدور</span>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
              className="admin-input h-12"
            >
              <option value="staff">مستخدم بصلاحيات محددة</option>
              <option value="super">مدير عام</option>
            </select>
          </label>
        ) : null}
        {user ? (
          <button
            type="button"
            role="switch"
            aria-checked={active}
            onClick={() => setActive(!active)}
            className="flex w-full items-center justify-between rounded-xl border border-[var(--admin-border)] px-4 py-3"
          >
            <span className="text-[14px]">{active ? "الحساب نشط" : "الحساب موقوف"}</span>
            <span
              className={cn(
                "relative h-7 w-12 rounded-full transition",
                active ? "bg-[var(--admin-accent)]" : "bg-[var(--admin-border)]",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-6 rounded-full bg-white shadow transition",
                  active ? "right-0.5" : "left-0.5",
                )}
              />
            </span>
          </button>
        ) : null}
      </section>

      {isStaff ? (
        <>
          <section className="admin-card mt-6 p-6">
            <h2 className="text-lg font-semibold">الفروع</h2>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">يقدر يشوف نابلس أو جنين أو الاثنين.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {BRANCH_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3",
                    selectedBranches.has(option.id)
                      ? "border-[var(--admin-accent)]"
                      : "border-[var(--admin-border)]",
                  )}
                >
                  <span>{option.label}</span>
                  <input
                    type="checkbox"
                    checked={selectedBranches.has(option.id)}
                    onChange={() => toggleBranch(option.id)}
                  />
                </label>
              ))}
            </div>
          </section>
          <section className="admin-card mt-6 p-6">
            <h2 className="text-lg font-semibold">الصفحات</h2>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">
              مثال: طلبات فقط، أو تصنيفات وأصناف فقط.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {STAFF_PAGES.map((page) => (
                <label
                  key={page.id}
                  className={cn(
                    "flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3",
                    selectedPages.has(page.id)
                      ? "border-[var(--admin-accent)]"
                      : "border-[var(--admin-border)]",
                  )}
                >
                  <span>{page.label}</span>
                  <input
                    type="checkbox"
                    checked={selectedPages.has(page.id)}
                    onChange={() => togglePage(page.id)}
                  />
                </label>
              ))}
            </div>
          </section>
        </>
      ) : (
        <p className="mt-6 text-[14px] text-[var(--admin-muted)]">
          المدير العام يشوف كل الصفحات وكل الفروع، بالإضافة للمستخدمين والمراقبة.
        </p>
      )}

      {error ? <p className="mt-4 text-[13px] text-[var(--admin-danger)]">{error}</p> : null}
      <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] py-4">
        <button type="button" onClick={onClose} className="admin-btn admin-btn-ghost">
          إلغاء
        </button>
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary min-w-32">
          {saving ? "جارٍ الحفظ…" : "حفظ"}
        </button>
      </div>
    </form>
  );
}
