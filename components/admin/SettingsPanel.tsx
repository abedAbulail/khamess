"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Branch } from "@/lib/types";

export function SettingsPanel({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(branches);
  const [saving, setSaving] = useState<string | null>(null);

  async function save(branch: Branch) {
    setSaving(branch.id);
    await fetch("/api/admin/menu", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "branch",
        id: branch.id,
        phone: branch.phone,
        whatsapp: branch.whatsapp,
        facebook: branch.facebook,
        instagram: branch.instagram,
        tiktok: branch.tiktok,
        address: branch.address,
      }),
    });
    setSaving(null);
    router.refresh();
  }

  function update(id: string, key: keyof Branch, value: string) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [key]: value } : row)),
    );
  }

  return (
    <div className="space-y-5">
      <h1 className="mb-2 text-3xl font-semibold">الإعدادات</h1>
      <p className="mb-6 text-[14px] text-[var(--admin-muted)]">
        أرقام واتساب تظهر في صفحة الروابط وفي رسالة الطلب. إذا ما حطيت فيسبوك أو إنستغرام أو تيك توك، الزر ما بظهر للزبون.
      </p>
      {rows.map((branch) => (
        <form
          key={branch.id}
          className="admin-card p-5"
          onSubmit={(event) => {
            event.preventDefault();
            void save(branch);
          }}
        >
          <h2 className="text-lg font-black">{branch.nameAr}</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field
              label="العنوان"
              value={branch.address}
              onChange={(value) => update(branch.id, "address", value)}
            />
            <Field
              label="الهاتف"
              value={branch.phone}
              onChange={(value) => update(branch.id, "phone", value)}
            />
            <Field
              label="واتساب (مع مفتاح الدولة، مثال 97059...)"
              value={branch.whatsapp}
              onChange={(value) => update(branch.id, "whatsapp", value)}
              dir="ltr"
            />
            <Field
              label="فيسبوك"
              value={branch.facebook}
              onChange={(value) => update(branch.id, "facebook", value)}
              dir="ltr"
            />
            <Field
              label="إنستغرام"
              value={branch.instagram}
              onChange={(value) => update(branch.id, "instagram", value)}
              dir="ltr"
            />
            <Field
              label="تيك توك"
              value={branch.tiktok}
              onChange={(value) => update(branch.id, "tiktok", value)}
              dir="ltr"
            />
          </div>
          <button
            type="submit"
            disabled={saving === branch.id}
            className="admin-btn admin-btn-primary mt-4"
          >
            {saving === branch.id ? "جارٍ الحفظ…" : "حفظ"}
          </button>
        </form>
      ))}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  dir,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-bold">{label}</span>
      <input
        value={value}
        dir={dir}
        onChange={(event) => onChange(event.target.value)}
        className="admin-input mt-1"
      />
    </label>
  );
}
