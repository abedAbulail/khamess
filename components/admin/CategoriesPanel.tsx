"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { EditorPage } from "@/components/admin/EditorPage";
import { MenuScopeGate, scopeTitle } from "@/components/admin/MenuScopeGate";
import type { BranchMenu, MenuCategory } from "@/lib/types";

export function CategoriesPanel({
  menus,
}: {
  menus: BranchMenu[];
}) {
  const router = useRouter();
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const menu = menus.find((entry) => entry.menuKey === menuKey) ?? null;
  const [editing, setEditing] = useState<MenuCategory | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  async function remove(id: string) {
    if (!confirm("حذف التصنيف وكل أصنافه؟")) return;
    await fetch(`/api/admin/menu?id=${id}&kind=category`, { method: "DELETE" });
    router.refresh();
  }

  async function save(nameAr: string, note: string) {
    if (!menu || !nameAr.trim()) return;
    setSaving(true);
    if (editing) {
      await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          id: editing.id,
          nameAr: nameAr.trim(),
          note,
        }),
      });
    } else {
      await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "category",
          branchId: menu.id,
          channel: menu.channel,
          nameAr: nameAr.trim(),
          note,
        }),
      });
    }
    setSaving(false);
    setEditing(undefined);
    router.refresh();
  }

  if (editing !== undefined && menu) {
    return (
      <EditorPage
        title={editing ? "تعديل تصنيف" : "إضافة تصنيف"}
        subtitle={scopeTitle(menu)}
        onClose={() => setEditing(undefined)}
      >
        <CategoryForm
          key={editing?.id ?? "new"}
          category={editing}
          saving={saving}
          onClose={() => setEditing(undefined)}
          onSave={save}
        />
      </EditorPage>
    );
  }

  return (
    <MenuScopeGate
      title="التصنيفات"
      hint="أضف أو عدّل أقسام هذه القائمة."
      menus={menus}
      selectedKey={menuKey}
      onSelect={setMenuKey}
    >
      {menu ? (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="admin-btn admin-btn-primary inline-flex items-center gap-2"
            >
              <Plus className="size-4" />
              إضافة تصنيف
            </button>
          </div>

          {menu.categories.map((category) => (
            <article key={category.id} className="admin-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-lg font-semibold">{category.nameAr}</p>
                <p className="mt-1 text-[12px] text-[var(--admin-muted)]">{category.items.length} صنف</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(category)}
                  className="admin-btn admin-btn-ghost inline-flex items-center gap-1"
                >
                  <Pencil className="size-3.5" />
                  تعديل
                </button>
                <button
                  type="button"
                  onClick={() => void remove(category.id)}
                  className="grid size-10 place-items-center rounded-xl text-[var(--admin-danger)]"
                  aria-label="حذف"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </MenuScopeGate>
  );
}

function CategoryForm({
  category,
  saving,
  onClose,
  onSave,
}: {
  category: MenuCategory | null;
  saving: boolean;
  onClose: () => void;
  onSave: (nameAr: string, note: string) => void;
}) {
  const [nameAr, setNameAr] = useState(category?.nameAr ?? "");
  const [note, setNote] = useState(category?.note ?? "");

  return (
    <form
      className="mx-auto max-w-xl"
      onSubmit={(event) => {
        event.preventDefault();
        onSave(nameAr, note);
      }}
    >
      <section className="admin-card p-6">
        <h2 className="text-lg font-semibold">تفاصيل التصنيف</h2>
        <p className="mt-1 text-[13px] text-[var(--admin-muted)]">يظهر كعنوان قسم في المنيو.</p>
        <label className="mt-6 block">
          <span className="mb-2 block text-[13px] font-medium text-[var(--admin-muted)]">اسم التصنيف</span>
          <input
            value={nameAr}
            onChange={(event) => setNameAr(event.target.value)}
            className="admin-input h-12"
            placeholder="مثال: سلطات خضراء"
            required
          />
        </label>
        <label className="mt-5 block">
          <span className="mb-2 block text-[13px] font-medium text-[var(--admin-muted)]">ملاحظة</span>
          <input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className="admin-input h-12"
            placeholder="اختياري — مثل: تُقدّم مع سلطات وبطاطا"
          />
        </label>
      </section>
      <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] py-4">
        <button type="button" onClick={onClose} className="admin-btn admin-btn-ghost">
          إلغاء
        </button>
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary min-w-32">
          {saving ? "جارٍ الحفظ…" : "حفظ التصنيف"}
        </button>
      </div>
    </form>
  );
}
