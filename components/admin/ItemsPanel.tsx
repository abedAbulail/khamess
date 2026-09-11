"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { EditorPage } from "@/components/admin/EditorPage";
import {
  categoriesForChannel,
  channelsOf,
  copyForChannel,
  groupMenuItems,
  type ItemGroup,
} from "@/lib/item-groups";
import { hasItemImage } from "@/lib/menu-utils";
import { cn, formatPrice } from "@/lib/cn";
import type { BranchMenu, MenuCategory, MenuChannel } from "@/lib/types";

type SizeDraft = { nameAr: string; price: string };
type ChannelDraft = {
  enabled: boolean;
  locked: boolean;
  categorySlug: string;
  sizes: SizeDraft[];
};

const SIZE_PRESETS = ["حجم واحد", "صغير", "وسط", "كبير"];
const CHANNELS: Array<{ id: MenuChannel; label: string; hint: string }> = [
  { id: "inside", label: "داخل المطعم", hint: "منيو الطاولات" },
  { id: "outside", label: "خارج / للطلب", hint: "منيو الزبون أونلاين" },
];

function sizeLabelFromName(nameAr: string) {
  if (nameAr.includes("صغير")) return "S";
  if (nameAr.includes("وسط")) return "M";
  if (nameAr.includes("كبير")) return "L";
  return "one";
}

function priceRange(sizes: Array<{ price: number }>) {
  if (!sizes.length) return "—";
  const prices = sizes.map((size) => size.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatPrice(min) : `${min}–${max} ₪`;
}

export function ItemsPanel({ menus }: { menus: BranchMenu[] }) {
  const router = useRouter();
  const groups = useMemo(() => groupMenuItems(menus), [menus]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ItemGroup | null | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(() => {
    const needle = query.trim();
    if (!needle) return groups;
    return groups.filter(
      (group) => group.nameAr.includes(needle) || group.nameEn.toLowerCase().includes(needle.toLowerCase()),
    );
  }, [groups, query]);

  async function removeGroup(slug: string) {
    if (!confirm("رح ينحذف من منيو الداخل والخارج لكل الفروع. متأكد؟")) return;
    await fetch(`/api/admin/menu?id=${encodeURIComponent(slug)}&kind=item-group`, {
      method: "DELETE",
    });
    router.refresh();
  }

  async function saveGroup(payload: {
    nameAr: string;
    nameEn: string;
    description: string;
    available: boolean;
    channels: Record<MenuChannel, ChannelDraft>;
    imageFile?: File | null;
    removeImage?: boolean;
  }) {
    setSaving(true);
    const placements = CHANNELS.filter(({ id }) => payload.channels[id].enabled).map(({ id }) => ({
      channel: id,
      categorySlug: payload.channels[id].categorySlug,
      sizes: payload.channels[id].sizes
        .filter((size) => size.nameAr.trim())
        .map((size, index) => ({
          nameAr: size.nameAr.trim(),
          label: sizeLabelFromName(size.nameAr),
          price: Number(size.price) || 0,
          sortOrder: index,
        })),
    }));

    if (editing) {
      await fetch("/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "item-group",
          slug: editing.slug,
          nameAr: payload.nameAr,
          nameEn: payload.nameEn,
          description: payload.description,
          available: payload.available,
          placements,
          ...(payload.removeImage && !payload.imageFile ? { imageUrl: "" } : {}),
        }),
      });
      if (payload.imageFile) {
        const data = new FormData();
        data.set("file", payload.imageFile);
        data.set("slug", editing.slug);
        await fetch("/api/admin/upload", { method: "POST", body: data });
      }
    } else {
      const response = await fetch("/api/admin/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "item-group",
          nameAr: payload.nameAr,
          nameEn: payload.nameEn,
          description: payload.description,
          placements,
        }),
      });
      const created = (await response.json()) as { slug?: string };
      if (payload.imageFile && created.slug) {
        const data = new FormData();
        data.set("file", payload.imageFile);
        data.set("slug", created.slug);
        await fetch("/api/admin/upload", { method: "POST", body: data });
      }
    }
    setSaving(false);
    setEditing(undefined);
    router.refresh();
  }

  if (editing !== undefined) {
    return (
      <EditorPage
        title={editing ? "تعديل صنف" : "إضافة صنف"}
        subtitle="التعديل ينحفظ داخل المطعم وبرّا، لكل الفروع"
        onClose={() => setEditing(undefined)}
      >
        <ItemForm
          key={editing?.slug ?? "new"}
          group={editing}
          menus={menus}
          saving={saving}
          onClose={() => setEditing(undefined)}
          onSave={saveGroup}
        />
      </EditorPage>
    );
  }

  return (
    <div>
      <p className="text-[12px] tracking-[0.25em] text-[var(--admin-muted)]">مطعم خميس</p>
      <h1 className="mt-2 text-3xl font-semibold">الأصناف</h1>
      <p className="mt-2 text-[15px] text-[var(--admin-muted)]">
        صنف واحد لكل الأكلات — عدّله مرة ويظهر داخل المطعم وبرّا.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="admin-input h-11 max-w-sm"
          placeholder="ابحث عن صنف…"
        />
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="admin-btn admin-btn-primary inline-flex items-center gap-2"
        >
          <Plus className="size-4" />
          إضافة صنف
        </button>
      </div>

      <div className="admin-card mt-4 overflow-x-auto">
        {rows.length === 0 ? (
          <p className="p-8 text-center text-[var(--admin-muted)]">ما في أصناف بعد.</p>
        ) : (
          <table className="w-full min-w-[980px] text-right text-[13px]">
            <thead className="border-b border-[var(--admin-border)] text-[var(--admin-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">الصنف</th>
                <th className="px-4 py-3 font-medium">القوائم</th>
                <th className="px-4 py-3 font-medium">الأسعار</th>
                <th className="px-4 py-3 font-medium">متوفر</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((group) => {
                const channels = channelsOf(group);
                return (
                  <tr key={group.slug} className="border-b border-[var(--admin-border)] last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {hasItemImage(group.imageUrl) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={group.imageUrl} alt="" className="size-12 rounded-lg object-cover" />
                        ) : (
                          <span className="grid size-12 place-items-center rounded-lg border border-dashed border-[var(--admin-border)] text-[10px] text-[var(--admin-muted)]">
                            بدون
                          </span>
                        )}
                        <div>
                          <p className="font-semibold">{group.nameAr}</p>
                          {group.nameEn ? (
                            <p className="text-[12px] text-[var(--admin-muted)]">{group.nameEn}</p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {channels.includes("inside") ? (
                          <span className="rounded-lg border border-[var(--admin-border)] px-2 py-1">داخل</span>
                        ) : null}
                        {channels.includes("outside") ? (
                          <span className="rounded-lg border border-[var(--admin-border)] px-2 py-1">خارج</span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 text-[var(--admin-muted)]">
                        {CHANNELS.filter(({ id }) => channels.includes(id)).map(({ id, label }) => {
                          const copy = copyForChannel(group, id);
                          return (
                            <span key={id}>
                              {label}: {priceRange(copy?.item.sizes ?? [])}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-lg px-3 py-1 ${
                          group.available
                            ? "bg-[var(--admin-accent)] text-[var(--admin-accent-text)]"
                            : "border border-[var(--admin-border)] text-[var(--admin-muted)]"
                        }`}
                      >
                        {group.available ? "نعم" : "لا"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => setEditing(group)}
                          className="admin-btn admin-btn-ghost inline-flex items-center gap-1 px-3"
                        >
                          <Pencil className="size-3.5" />
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeGroup(group.slug)}
                          className="grid size-10 place-items-center rounded-xl text-[var(--admin-danger)]"
                          aria-label="حذف"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
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

function emptyChannel(categories: MenuCategory[]): ChannelDraft {
  return {
    enabled: Boolean(categories[0]),
    locked: false,
    categorySlug: categories[0]?.slug ?? "",
    sizes: [{ nameAr: "حجم واحد", price: "10" }],
  };
}

function ItemForm({
  group,
  menus,
  saving,
  onClose,
  onSave,
}: {
  group: ItemGroup | null;
  menus: BranchMenu[];
  saving: boolean;
  onClose: () => void;
  onSave: (payload: {
    nameAr: string;
    nameEn: string;
    description: string;
    available: boolean;
    channels: Record<MenuChannel, ChannelDraft>;
    imageFile?: File | null;
    removeImage?: boolean;
  }) => void;
}) {
  const insideCategories = categoriesForChannel(menus, "inside");
  const outsideCategories = categoriesForChannel(menus, "outside");
  const [nameAr, setNameAr] = useState(group?.nameAr ?? "");
  const [nameEn, setNameEn] = useState(group?.nameEn ?? "");
  const [description, setDescription] = useState(group?.description ?? "");
  const [available, setAvailable] = useState(group?.available ?? true);
  const [channels, setChannels] = useState<Record<MenuChannel, ChannelDraft>>(() => {
    if (!group) {
      return {
        inside: emptyChannel(insideCategories),
        outside: emptyChannel(outsideCategories),
      };
    }
    const fromChannel = (channel: MenuChannel, categories: MenuCategory[]): ChannelDraft => {
      const copy = copyForChannel(group, channel);
      return {
        enabled: Boolean(copy),
        locked: Boolean(copy),
        categorySlug: copy?.category.slug ?? categories[0]?.slug ?? "",
        sizes: copy?.item.sizes.length
          ? copy.item.sizes.map((size) => ({ nameAr: size.nameAr, price: String(size.price) }))
          : [{ nameAr: "حجم واحد", price: "10" }],
      };
    };
    return {
      inside: fromChannel("inside", insideCategories),
      outside: fromChannel("outside", outsideCategories),
    };
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [preview, setPreview] = useState(
    hasItemImage(group?.imageUrl) ? group?.imageUrl ?? "" : "",
  );

  useEffect(() => {
    if (!imageFile) return;
    const url = URL.createObjectURL(imageFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function patchChannel(channel: MenuChannel, patch: Partial<ChannelDraft>) {
    setChannels((current) => ({
      ...current,
      [channel]: { ...current[channel], ...patch },
    }));
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!nameAr.trim()) return;
        if (!CHANNELS.some(({ id }) => channels[id].enabled && channels[id].categorySlug)) return;
        onSave({
          nameAr: nameAr.trim(),
          nameEn: nameEn.trim(),
          description: description.trim(),
          available,
          channels,
          imageFile,
          removeImage,
        });
      }}
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <section className="admin-card p-6">
            <h2 className="text-lg font-semibold">المعلومات الأساسية</h2>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">الاسم يظهر للزبون في كل القوائم.</p>
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
          </section>

          {CHANNELS.map(({ id, label, hint }) => {
            const cats = id === "inside" ? insideCategories : outsideCategories;
            const draft = channels[id];
            if (!cats.length) return null;
            return (
              <section key={id} className="admin-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{label}</h2>
                    <p className="mt-1 text-[13px] text-[var(--admin-muted)]">{hint}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.enabled}
                    disabled={draft.locked && draft.enabled}
                    onClick={() => {
                      if (draft.locked && draft.enabled) return;
                      patchChannel(id, { enabled: !draft.enabled });
                    }}
                    className="flex items-center gap-3 rounded-xl border border-[var(--admin-border)] px-3 py-2 text-[13px] disabled:opacity-60"
                  >
                    <span>{draft.enabled ? "ظاهر" : "مخفي"}</span>
                    <span
                      className={cn(
                        "relative h-6 w-10 rounded-full transition",
                        draft.enabled ? "bg-[var(--admin-accent)]" : "bg-[var(--admin-border)]",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 size-5 rounded-full bg-white shadow transition",
                          draft.enabled ? "right-0.5" : "left-0.5",
                        )}
                      />
                    </span>
                  </button>
                </div>

                {draft.enabled ? (
                  <>
                    <div className="mt-5 max-w-sm">
                      <Field label="التصنيف">
                        <select
                          value={draft.categorySlug}
                          onChange={(event) => patchChannel(id, { categorySlug: event.target.value })}
                          className="admin-input h-12"
                        >
                          {cats.map((category) => (
                            <option key={category.slug} value={category.slug}>
                              {category.nameAr}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <div className="mt-6 flex items-center justify-between gap-3">
                      <p className="text-[13px] text-[var(--admin-muted)]">سعر لكل حجم في هذه القائمة.</p>
                      <button
                        type="button"
                        className="admin-btn admin-btn-ghost h-10 text-[13px]"
                        onClick={() =>
                          patchChannel(id, { sizes: [...draft.sizes, { nameAr: "وسط", price: "" }] })
                        }
                      >
                        + حجم
                      </button>
                    </div>
                    <div className="mt-3 overflow-hidden rounded-xl border border-[var(--admin-border)]">
                      <div className="grid grid-cols-[1fr_8rem_3rem] border-b border-[var(--admin-border)] bg-[var(--admin-hover)] px-4 py-2 text-[12px] text-[var(--admin-muted)]">
                        <span>الحجم</span>
                        <span>السعر ₪</span>
                        <span></span>
                      </div>
                      {draft.sizes.map((size, index) => (
                        <div
                          key={`${id}-${index}`}
                          className="grid grid-cols-[1fr_8rem_3rem] items-center gap-2 border-b border-[var(--admin-border)] px-3 py-2 last:border-0"
                        >
                          <select
                            value={size.nameAr}
                            onChange={(event) =>
                              patchChannel(id, {
                                sizes: draft.sizes.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, nameAr: event.target.value } : entry,
                                ),
                              })
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
                              patchChannel(id, {
                                sizes: draft.sizes.map((entry, entryIndex) =>
                                  entryIndex === index ? { ...entry, price: event.target.value } : entry,
                                ),
                              })
                            }
                            className="admin-input h-11 tabular-nums"
                            inputMode="numeric"
                            placeholder="0"
                          />
                          <button
                            type="button"
                            disabled={draft.sizes.length === 1}
                            className="grid size-10 place-items-center rounded-lg text-[var(--admin-danger)] disabled:opacity-30"
                            onClick={() =>
                              patchChannel(id, {
                                sizes: draft.sizes.filter((_, entryIndex) => entryIndex !== index),
                              })
                            }
                            aria-label="حذف الحجم"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                ) : null}
              </section>
            );
          })}
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
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">نفس الصورة لكل القوائم.</p>
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
