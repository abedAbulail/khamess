"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { hasItemImage } from "@/lib/menu-utils";
import type { BranchMenu, MenuItem } from "@/lib/types";

export function MenuEditor({ menus }: { menus: BranchMenu[] }) {
  const router = useRouter();
  const [branchId, setBranchId] = useState(menus[0]?.id ?? "nablus");
  const menu = menus.find((entry) => entry.id === branchId) ?? menus[0];
  const [saving, setSaving] = useState<string | null>(null);
  const [nameAr, setNameAr] = useState("");
  const [price, setPrice] = useState("10");
  const [categoryId, setCategoryId] = useState(menu?.categories[0]?.id ?? "");

  const categories = useMemo(() => menu?.categories ?? [], [menu]);

  async function patchItem(item: MenuItem, extra: Record<string, unknown>) {
    setSaving(item.id);
    await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "item", id: item.id, ...extra }),
    });
    setSaving(null);
    router.refresh();
  }

  async function saveSizes(item: MenuItem, sizes: Array<{ id: string; price: number }>) {
    setSaving(item.id);
    await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "item", id: item.id, sizes }),
    });
    setSaving(null);
    router.refresh();
  }

  async function addItem() {
    if (!nameAr.trim() || !categoryId) return;
    await fetch("/api/admin/menu", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branchId,
        categoryId,
        nameAr: nameAr.trim(),
        price: Number(price) || 0,
      }),
    });
    setNameAr("");
    router.refresh();
  }

  async function removeItem(id: string) {
    if (!confirm("حذف هذا الصنف؟")) return;
    await fetch(`/api/admin/menu?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  if (!menu) return <p>ما في فروع.</p>;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {menus.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => {
              setBranchId(entry.id);
              setCategoryId(entry.categories[0]?.id ?? "");
            }}
            className={`border px-4 py-2 text-[14px] ${
              entry.id === branchId ? "border-gold bg-gold text-black" : "border-line"
            }`}
          >
            {entry.nameAr}
          </button>
        ))}
      </div>

      <section className="mt-6 border border-line bg-paper p-5">
        <h2 className="font-semibold">إضافة صنف</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-4">
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="min-h-11 border border-line bg-black px-3"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nameAr}
              </option>
            ))}
          </select>
          <input
            value={nameAr}
            onChange={(event) => setNameAr(event.target.value)}
            placeholder="اسم الصنف"
            className="min-h-11 border border-line bg-black px-3"
          />
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="السعر"
            className="min-h-11 border border-line bg-black px-3"
          />
          <button
            type="button"
            onClick={() => void addItem()}
            className="min-h-11 bg-gold font-semibold text-black"
          >
            إضافة
          </button>
        </div>
      </section>

      {categories.map((category) => (
        <section key={category.id} className="mt-6">
          <h3 className="mb-3 text-lg font-semibold text-gold">{category.nameAr}</h3>
          <div className="overflow-x-auto border border-line bg-paper">
            <table className="w-full min-w-[860px] text-right text-[13px]">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">صورة</th>
                  <th className="px-4 py-3 font-medium">الصنف</th>
                  <th className="px-4 py-3 font-medium">الأسعار</th>
                  <th className="px-4 py-3 font-medium">متوفر</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {category.items.map((item) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    saving={saving === item.id}
                    onToggle={() => void patchItem(item, { available: !item.available })}
                    onSaveSizes={(sizes) => void saveSizes(item, sizes)}
                    onDelete={() => void removeItem(item.id)}
                    onUploaded={() => router.refresh()}
                    onClearImage={() => void patchItem(item, { imageUrl: "" })}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function ItemRow({
  item,
  saving,
  onToggle,
  onSaveSizes,
  onDelete,
  onUploaded,
  onClearImage,
}: {
  item: MenuItem;
  saving: boolean;
  onToggle: () => void;
  onSaveSizes: (sizes: Array<{ id: string; price: number }>) => void;
  onDelete: () => void;
  onUploaded: () => void;
  onClearImage: () => void;
}) {
  const [prices, setPrices] = useState(
    Object.fromEntries(item.sizes.map((size) => [size.id, String(size.price)])),
  );
  const [uploading, setUploading] = useState(false);
  const photo = hasItemImage(item.imageUrl);

  async function upload(file: File) {
    setUploading(true);
    const data = new FormData();
    data.set("file", file);
    data.set("itemId", item.id);
    await fetch("/api/admin/upload", { method: "POST", body: data });
    setUploading(false);
    onUploaded();
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="size-12 object-cover" />
          ) : (
            <span className="grid size-12 place-items-center border border-dashed border-line text-[10px] text-muted">
              بدون
            </span>
          )}
          <label className="cursor-pointer border border-line px-2 py-1 text-[12px]">
            {uploading ? "…" : "رفع"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
              }}
            />
          </label>
          {photo ? (
            <button type="button" onClick={onClearImage} className="text-[12px] text-muted">
              حذف
            </button>
          ) : null}
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="font-semibold">{item.nameAr}</p>
        <p className="text-[12px] text-muted">{item.nameEn}</p>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap items-end gap-2">
          {item.sizes.map((size) => (
            <label key={size.id} className="block">
              <span className="text-[11px] text-muted">{size.nameAr}</span>
              <input
                value={prices[size.id] ?? ""}
                onChange={(event) =>
                  setPrices((current) => ({ ...current, [size.id]: event.target.value }))
                }
                className="mt-1 h-9 w-20 border border-line bg-black px-2 tabular-nums"
              />
            </label>
          ))}
          <button
            type="button"
            disabled={saving}
            onClick={() =>
              onSaveSizes(
                item.sizes.map((size) => ({
                  id: size.id,
                  price: Number(prices[size.id]) || 0,
                })),
              )
            }
            className="h-9 bg-gold px-3 font-semibold text-black"
          >
            حفظ
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={onToggle}
          className={`px-3 py-1 ${item.available ? "bg-gold text-black" : "border border-line text-muted"}`}
        >
          {item.available ? "نعم" : "لا"}
        </button>
      </td>
      <td className="px-4 py-3">
        <button type="button" onClick={onDelete} className="text-red-400">
          حذف الصنف
        </button>
      </td>
    </tr>
  );
}
