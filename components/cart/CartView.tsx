"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Trash2 } from "lucide-react";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { useHydratedCart } from "@/components/menu/CartBar";
import { getCartSubtotal, useCartStore } from "@/lib/cart";
import { formatPrice } from "@/lib/cn";
import { saveLastOrder } from "@/lib/last-order";
import { hasItemImage } from "@/lib/menu-utils";
import type { Branch } from "@/lib/types";
import { VisitTracker } from "@/lib/visit-client";
import { buildOrderMessage } from "@/lib/whatsapp";

export function CartView({ branch }: { branch: Branch }) {
  const router = useRouter();
  const { ready, items } = useHydratedCart();
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearBranch = useCartStore((state) => state.clearBranch);
  const lines = items.filter((line) => line.branchId === branch.id);
  const total = getCartSubtotal(lines, branch.id);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [goingBack, setGoingBack] = useState(false);

  async function sendOrder() {
    if (!name.trim() || !phone.trim()) {
      setError("اكتب الاسم ورقم الهاتف");
      return;
    }
    if (!lines.length) return;
    setSending(true);
    setError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId: branch.id,
          customerName: name.trim(),
          phone: phone.trim(),
          notes: notes.trim(),
          items: lines.map((line) => ({
            itemId: line.itemId,
            nameAr: line.nameAr,
            sizeLabel: line.sizeNameAr,
            quantity: line.quantity,
            price: line.price,
          })),
        }),
      });
      if (!response.ok) {
        setError("ما قدرناش نحفظ الطلب، جرّب مرة ثانية");
        return;
      }
      const created = (await response.json()) as { id?: string; subtotal?: number };
      const message = buildOrderMessage(branch, lines, name.trim(), notes.trim(), phone.trim());
      saveLastOrder(branch.slug, {
        id: created.id ?? "",
        name: name.trim(),
        total: created.subtotal ?? total,
        whatsapp: branch.whatsapp,
        message,
      });
      clearBranch(branch.id);
      router.push(`/${branch.slug}/order-success`);
    } catch {
      setError("في مشكلة بالاتصال");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-svh bg-black px-4 py-6">
      <VisitTracker page="cart" branchId={branch.id} />
      <Link
        href={`/${branch.slug}/menu`}
        onClick={() => setGoingBack(true)}
        className="inline-flex min-h-9 items-center gap-1.5 text-[14px] text-muted"
      >
        {goingBack ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            جاري التحميل
          </>
        ) : (
          <>
            <ArrowRight className="size-4" /> رجوع للمنيو
          </>
        )}
      </Link>
      <h1 className="mt-4 text-3xl font-semibold">السلة</h1>
      <p className="mt-1 text-gold">{branch.nameAr}</p>

      {!ready ? (
        <p className="mt-10 text-muted">جاري التحميل…</p>
      ) : lines.length === 0 ? (
        <p className="mt-10 border border-line bg-paper p-6 text-center text-muted">
          السلة فاضية.{" "}
          <Link
            href={`/${branch.slug}/menu`}
            onClick={() => setGoingBack(true)}
            className="inline-flex items-center gap-1.5 font-semibold text-gold"
          >
            {goingBack ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                جاري التحميل
              </>
            ) : (
              "ارجع للمنيو"
            )}
          </Link>
        </p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-line border border-line">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-3 bg-paper p-4">
                {hasItemImage(line.imageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={line.imageUrl} alt="" className="size-16 object-cover" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{line.nameAr}</p>
                  {line.sizeLabel !== "one" ? (
                    <p className="text-[13px] text-muted">{line.sizeNameAr}</p>
                  ) : null}
                  <p className="mt-1 text-[14px] font-semibold text-gold">
                    {formatPrice(line.price * line.quantity)}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button type="button" aria-label="حذف" onClick={() => removeItem(line.key)} className="text-muted">
                    <Trash2 className="size-4" />
                  </button>
                  <QuantitySelector
                    value={line.quantity}
                    onChange={(value) => setQuantity(line.key, value)}
                  />
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 border border-line bg-paper p-5">
            <div className="flex items-center justify-between text-[17px] font-semibold">
              <span>المجموع</span>
              <span className="text-gold">{formatPrice(total)}</span>
            </div>
            <label className="mt-5 block text-[13px] text-gold">الاسم</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 min-h-12 w-full border border-line bg-black px-3"
            />
            <label className="mt-4 block text-[13px] text-gold">رقم الهاتف</label>
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              inputMode="tel"
              className="mt-1 min-h-12 w-full border border-line bg-black px-3"
            />
            <label className="mt-4 block text-[13px] text-gold">ملاحظات</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="mt-1 w-full border border-line bg-black px-3 py-3"
            />
            {error ? <p className="mt-3 text-[13px] text-red-400">{error}</p> : null}
            <button
              type="button"
              onClick={() => void sendOrder()}
              disabled={sending}
              className="mt-5 min-h-14 w-full bg-gold text-[16px] font-semibold text-black disabled:opacity-60"
            >
              {sending ? "جارٍ الإرسال…" : "تأكيد الطلب"}
            </button>
          </div>
        </>
      )}
    </main>
  );
}
