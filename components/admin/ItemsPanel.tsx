"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { EditorPage } from "@/components/admin/EditorPage";
import { MenuScopeGate, scopeTitle } from "@/components/admin/MenuScopeGate";
import { hasItemImage } from "@/lib/menu-utils";
import { cn, formatPrice } from "@/lib/cn";
import type { BranchMenu, MenuCategory, MenuItem } from "@/lib/types";

type SizeDraft = { id?: string; nameAr: string; price: string };

const SIZE_PRESETS = ["حجم واحد", "صغير", "وسط", "كبير"];

function sizeLabelFromName(nameAr: string) {
  if (nameAr.includes("صغير")) return "S";
  if (nameAr.includes("وسط")) return "M";
  if (nameAr.includes("كبير")) return "L";
  return "one";
}

export function ItemsPanel({
  menus,
}: {
  menus: BranchMenu[];
}) {
  const router = useRouter();
  const [menuKey, setMenuKey] = useState<string | null>(null);
  const menu = menus.find((entry) => entry.menuKey === menuKey) ?? null;
  const categories = useMemo(() => menu?.categories ?? [], [menu]);
  const [editing, setEditing] = useState<MenuItem | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () =>
      categories.flatMap((category) =>
        category.items.map((item) => ({ item, category })),
      ),
    [categories],
  );

  async function removeItem(id: string) {
    if (!confirm("حذف هذا الصنف؟")) return;
    await fetch(`/api/admin/menu?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function saveItem(payload: {
    nameAr: string;
    nameEn: string;
    description: string;
    categoryId: string;
    available: boolean;
    sizes: SizeDraft[];
    imageFile?: File | null;
    removeImage?: boolean;
  }) {
    if (!menu) return;
    setSaving(true);
    const sizes = payload.sizes
      .filter((size) => size.nameAr.trim())
      .map((size, index) => ({
        id: size.id,
        nameAr: size.nameAr.trim(),
        label: sizeLabelFromName(size.nameAr),
        price: Number(size.price) || 0,
        sortOrder: index,
      }));

    if (editing) {
      await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "item",
          id: editing.id,
          nameAr: payload.nameAr,
          nameEn: payload.nameEn,
          description: payload.description,
          categoryId: payload.categoryId,
          available: payload.available,
          sizes,
          ...(payload.removeImage && !payload.imageFile ? { imageUrl: "" } : {}),
        }),
      });
      if (payload.imageFile) {
        const data = new FormData();
        data.set("file", payload.imageFile);
        data.set("itemId", editing.id);
        await fetch("/api/admin/upload", { method: "POST", body: data });
      }
    } else {
      const response = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: menu.id,
          channel: menu.channel,
          categoryId: payload.categoryId,
          nameAr: payload.nameAr,
          nameEn: payload.nameEn,
          description: payload.description,
          sizes,
        }),
      });
      const created = (await response.json()) as { id?: string };
      if (payload.imageFile && created.id) {
        const data = new FormData();
        data.set("file", payload.imageFile);
        data.set("itemId", created.id);
        await fetch("/api/admin/upload", { method: "POST", body: data });
      }
    }
    setSaving(false);
    setEditing(undefined);
    router.refresh();
  }

  if (editing !== undefined && menu) {
    return (
      <EditorPage
        title={editing ? "تعديل صنف" : "إضافة صنف"}
        subtitle={scopeTitle(menu)}
        onClose={() => setEditing(undefined)}
      >
        <ItemForm
          key={editing?.id ?? "new"}
          item={editing}
          categories={categories}
          saving={saving}
          onClose={() => setEditing(undefined)}
          onSave={saveItem}
        />
      </EditorPage>
    );
  }

  return (
    <MenuScopeGate
      title="الأصناف"
      hint="عدّل الأسعار والصور والتوفر لهذه القائمة."
      menus={menus}
      selectedKey={menuKey}
      onSelect={setMenuKey}
    >
      {menu ? (
        <div>
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="admin-btn admin-btn-primary inline-flex items-center gap-2"
            >
              <Plus className="size-4" />
              إضافة صنف
            </button>
          </div>

          <div className="admin-card overflow-x-auto">
            {rows.length === 0 ? (
              <p className="p-8 text-center text-[var(--admin-muted)]">ما في أصناف بعد.</p>
            ) : (
              <table className="w-full min-w-[980px] text-right text-[13px]">
                <thead className="border-b border-[var(--admin-border)] text-[var(--admin-muted)]">
                  <tr>
                    <th className="px-4 py-3 font-medium">الصنف</th>
                    <th className="px-4 py-3 font-medium">الوصف</th>
                    <th className="px-4 py-3 font-medium">التصنيف</th>
                    <th className="px-4 py-3 font-medium">الأحجام والأسعار</th>
                    <th className="px-4 py-3 font-medium">متوفر</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ item, category }) => (
                    <tr key={item.id} className="border-b border-[var(--admin-border)] last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {hasItemImage(item.imageUrl) ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.imageUrl} alt="" className="size-12 rounded-lg object-cover" />
                          ) : (
                            <span className="grid size-12 place-items-center rounded-lg border border-dashed border-[var(--admin-border)] text-[10px] text-[var(--admin-muted)]">
                              بدون
                            </span>
                          )}
                          <div>
                            <p className="font-semibold">{item.nameAr}</p>
                            {item.nameEn ? (
                              <p className="text-[12px] text-[var(--admin-muted)]">{item.nameEn}</p>
                            ) : null}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--admin-muted)]">
                        {item.description.trim() ? item.description : "—"}
                      </td>
                      <td className="px-4 py-3">{category.nameAr}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {item.sizes.map((size) => (
                            <span key={size.id}>
                              {size.nameAr}: {formatPrice(size.price)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-lg px-3 py-1 ${
                            item.available
                              ? "bg-[var(--admin-accent)] text-[var(--admin-accent-text)]"
                              : "border border-[var(--admin-border)] text-[var(--admin-muted)]"
                          }`}
                        >
                          {item.available ? "نعم" : "لا"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-start gap-2">
                          <button
                            type="button"
                            onClick={() => setEditing(item)}
                            className="admin-btn admin-btn-ghost inline-flex items-center gap-1 px-3"
                          >
                            <Pencil className="size-3.5" />
                            تعديل
                          </button>
                          <button
                            type="button"
                            onClick={() => void removeItem(item.id)}
                            className="grid size-10 place-items-center rounded-xl text-[var(--admin-danger)]"
                            aria-label="حذف"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : null}
    </MenuScopeGate>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[13px] font-medium text-[var(--admin-muted)]">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-[12px] text-[var(--admin-muted)]">{hint}</span> : null}
    </label>
  );
}

function ItemForm({
  item,
  categories,
  saving,
  onClose,
  onSave,
}: {
  item: MenuItem | null;
  categories: MenuCategory[];
  saving: boolean;
  onClose: () => void;
  onSave: (payload: {
    nameAr: string;
    nameEn: string;
    description: string;
    categoryId: string;
    available: boolean;
    sizes: SizeDraft[];
    imageFile?: File | null;
    removeImage?: boolean;
  }) => void;
}) {
  const [nameAr, setNameAr] = useState(item?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(item?.nameEn ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? categories[0]?.id ?? "");
  const [available, setAvailable] = useState(item?.available ?? true);
  const [sizes, setSizes] = useState<SizeDraft[]>(
    item?.sizes.length
      ? item.sizes.map((size) => ({ id: size.id, nameAr: size.nameAr, price: String(size.price) }))
      : [{ nameAr: "حجم واحد", price: "10" }],
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState(
    hasItemImage(item?.imageUrl) ? item?.imageUrl ?? "" : "",
  );

  useEffect(() => {
    setCategoryId((current) => current || categories[0]?.id || "");
  }, [categories]);

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!nameAr.trim() || !categoryId) return;
        onSave({
          nameAr: nameAr.trim(),
          nameEn: nameEn.trim(),
          description: description.trim(),
          categoryId,
          available,
          sizes,
          imageFile,
          removeImage,
        });
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="admin-card p-6">
            <h2 className="text-lg font-semibold">المعلومات الأساسية</h2>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">الاسم يظهر للزبون في المنيو.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="الاسم بالعربي">
                <input
                  value={nameAr}
                  onChange={(event) => setNameAr(event.target.value)}
                  className="admin-input h-12"
                  placeholder="مثال: سلطة جرجير"
                  required
                />
              </Field>
              <Field label="الاسم بالإنجليزي">
                <input
                  value={nameEn}
                  onChange={(event) => setNameEn(event.target.value)}
                  className="admin-input h-12"
                  placeholder="Arugula salad"
                  dir="ltr"
                />
              </Field>
            </div>
            <div className="mt-5">
              <Field label="الوصف" hint="اختياري — اتركه فارغ حالياً إذا بدك.">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className="admin-input min-h-28 py-3"
                  placeholder="مكونات قصيرة أو طريقة التقديم"
                />
              </Field>
            </div>
            <div className="mt-5 max-w-sm">
              <Field label="التصنيف">
                <select
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="admin-input h-12"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.nameAr}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section className="admin-card p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">الأحجام والأسعار</h2>
                <p className="mt-1 text-[13px] text-[var(--admin-muted)]">سعر لكل حجم يظهر في المنيو.</p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost h-10 text-[13px]"
                onClick={() => setSizes([...sizes, { nameAr: "وسط", price: "" }])}
              >
                + حجم
              </button>
            </div>
            <div className="mt-5 overflow-hidden rounded-xl border border-[var(--admin-border)]">
              <div className="grid grid-cols-[1fr_8rem_3rem] border-b border-[var(--admin-border)] bg-[var(--admin-hover)] px-4 py-2 text-[12px] text-[var(--admin-muted)]">
                <span>الحجم</span>
                <span>السعر ₪</span>
                <span></span>
              </div>
              {sizes.map((size, index) => (
                <div
                  key={size.id ?? `new-${index}`}
                  className="grid grid-cols-[1fr_8rem_3rem] items-center gap-2 border-b border-[var(--admin-border)] px-3 py-2 last:border-0"
                >
                  <select
                    value={size.nameAr}
                    onChange={(event) =>
                      setSizes(
                        sizes.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, nameAr: event.target.value } : entry,
                        ),
                      )
                    }
                    className="admin-input h-11"
                  >
                    {SIZE_PRESETS.includes(size.nameAr) ? null : (
                      <option value={size.nameAr}>{size.nameAr}</option>
                    )}
                    {SIZE_PRESETS.map((preset) => (
                      <option key={preset} value={preset}>
                        {preset}
                      </option>
                    ))}
                  </select>
                  <input
                    value={size.price}
                    onChange={(event) =>
                      setSizes(
                        sizes.map((entry, entryIndex) =>
                          entryIndex === index ? { ...entry, price: event.target.value } : entry,
                        ),
                      )
                    }
                    className="admin-input h-11 tabular-nums"
                    inputMode="numeric"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    disabled={sizes.length === 1}
                    className="grid size-10 place-items-center rounded-lg text-[var(--admin-danger)] disabled:opacity-30"
                    onClick={() => setSizes(sizes.filter((_, entryIndex) => entryIndex !== index))}
                    aria-label="حذف الحجم"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="admin-card p-6">
            <h2 className="text-lg font-semibold">الحالة</h2>
            <button
              type="button"
              role="switch"
              aria-checked={available}
              onClick={() => setAvailable(!available)}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-[var(--admin-border)] px-4 py-3"
            >
              <span className="text-[14px]">{available ? "متوفر للطلب" : "غير متوفر"}</span>
              <span
                className={cn(
                  "relative h-7 w-12 rounded-full transition",
                  available ? "bg-[var(--admin-accent)]" : "bg-[var(--admin-border)]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-6 rounded-full bg-white shadow transition",
                    available ? "right-0.5" : "left-0.5",
                  )}
                />
              </span>
            </button>
          </section>

          <section className="admin-card p-6">
            <h2 className="text-lg font-semibold">الصورة</h2>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">مربع، تظهر بجانب اسم الصنف.</p>
            <label className="mt-5 flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-[var(--admin-border)] bg-[var(--admin-input)] transition hover:border-[var(--admin-accent)]">
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="" className="aspect-square w-full object-cover" />
              ) : (
                <div className="flex aspect-square w-full flex-col items-center justify-center gap-2 px-4 text-center">
                  <ImagePlus className="size-8 text-[var(--admin-muted)]" />
                  <p className="text-[13px] font-medium">اضغط لرفع صورة</p>
                  <p className="text-[12px] text-[var(--admin-muted)]">PNG أو JPG حتى 4MB</p>
                </div>
              )}
              <input
                key={preview || "empty"}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => {
                  setRemoveImage(false);
                  setImageFile(event.target.files?.[0] ?? null);
                }}
              />
            </label>
            {preview ? (
              <div className="mt-3 flex flex-col items-center gap-2">
                <p className="text-center text-[12px] text-[var(--admin-muted)]">اضغط الصورة لتغييرها</p>
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setPreview("");
                    setRemoveImage(true);
                  }}
                  className="admin-btn admin-btn-ghost inline-flex h-10 items-center gap-2 text-[13px] text-[var(--admin-danger)]"
                >
                  <Trash2 className="size-4" />
                  حذف الصورة
                </button>
              </div>
            ) : null}
          </section>
        </aside>
      </div>

      <div className="sticky bottom-0 mt-8 flex items-center justify-end gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-bg)] py-4">
        <button type="button" onClick={onClose} className="admin-btn admin-btn-ghost">
          إلغاء
        </button>
        <button type="submit" disabled={saving} className="admin-btn admin-btn-primary min-w-32">
          {saving ? "جارٍ الحفظ…" : "حفظ الصنف"}
        </button>
      </div>
    </form>
  );
}
