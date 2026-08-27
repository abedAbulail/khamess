"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { QuantitySelector } from "@/components/shared/QuantitySelector";
import { CartBar } from "@/components/menu/CartBar";
import { useCartStore } from "@/lib/cart";
import { formatPrice } from "@/lib/cn";
import { hasItemImage } from "@/lib/menu-utils";
import type { BranchMenu, MenuCategory, MenuItem } from "@/lib/types";
import { trackVisit, VisitTracker } from "@/lib/visit-client";

export function ItemDetail({
  branch,
  category,
  item,
  mode,
}: {
  branch: BranchMenu;
  category: MenuCategory;
  item: MenuItem;
  mode: "order" | "view";
}) {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [sizeId, setSizeId] = useState(item.sizes[0]?.id ?? "");
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [openingCart, setOpeningCart] = useState(false);
  const selected = item.sizes.find((size) => size.id === sizeId) ?? item.sizes[0];
  const view = mode === "view";
  const photo = hasItemImage(item.imageUrl);

  function add() {
    if (!selected || adding || added) return;
    setAdding(true);
    addItem(item, selected.id, qty);
    void trackVisit({ page: "add-to-cart", branchId: branch.id });
    window.setTimeout(() => {
      setAdding(false);
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1400);
    }, 450);
  }

  function openCart() {
    if (openingCart) return;
    setOpeningCart(true);
    router.push(`/${branch.slug}/cart`);
  }

  return (
    <main className="min-h-svh bg-black pb-32 lg:pb-0">
      <VisitTracker page="item" branchId={branch.id} />
      <div className="lg:mx-auto lg:grid lg:min-h-svh lg:max-w-6xl lg:grid-cols-2 lg:items-stretch">
        <div className="relative border-b border-line lg:border-b-0 lg:border-l">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.imageUrl}
              alt={item.nameAr}
              className="h-64 w-full object-cover lg:sticky lg:top-0 lg:h-svh lg:min-h-[36rem]"
            />
          ) : (
            <div className="flex h-56 items-center justify-center bg-paper lg:sticky lg:top-0 lg:h-svh">
              <Logo className="h-36 w-auto opacity-90 lg:h-52" />
            </div>
          )}
          <Link
            href={view ? `/view/${branch.slug}` : `/${branch.slug}/menu`}
            className="absolute right-4 top-4 inline-flex size-11 items-center justify-center border border-gold/50 bg-black/70 text-gold"
          >
            <ArrowRight className="size-5" />
          </Link>
        </div>

        <section className="flex flex-col px-5 pt-7 sm:px-8 lg:justify-center lg:px-12 lg:py-16">
          <p className="text-[12px] tracking-[0.25em] text-gold lg:text-[13px]">{category.nameAr}</p>
          <h1 className="mt-2 text-3xl font-semibold lg:text-5xl">{item.nameAr}</h1>
          <p className="mt-1 text-[14px] text-muted lg:mt-3 lg:text-[16px]">{item.nameEn}</p>
          {item.description ? (
            <p className="mt-4 max-w-lg text-[15px] leading-7 text-ink/80 lg:mt-6 lg:text-[17px] lg:leading-8">
              {item.description}
            </p>
          ) : null}

          {item.sizes.length > 1 ? (
            <div className="mt-8 lg:mt-10">
              <p className="text-[12px] tracking-[0.2em] text-gold">اختر الحجم</p>
              <div className="mt-3 grid grid-cols-3 gap-2 lg:max-w-md lg:gap-3">
                {item.sizes.map((size) => (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => setSizeId(size.id)}
                    className={`border px-3 py-3 text-center lg:py-4 ${
                      size.id === selected?.id
                        ? "border-gold bg-gold text-black"
                        : "border-line bg-paper"
                    }`}
                  >
                    <span className="block text-[14px] font-semibold">{size.nameAr}</span>
                    <span className="mt-1 block text-[13px] tabular-nums">
                      {formatPrice(size.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-2xl font-semibold text-gold lg:mt-8 lg:text-4xl">
              {selected ? formatPrice(selected.price) : ""}
            </p>
          )}

          {view ? (
            <p className="mt-8 border border-line bg-paper px-4 py-4 text-[14px] leading-7 text-muted lg:max-w-md lg:text-[15px]">
              أخبر النادل: <span className="font-semibold text-ink">{item.nameAr}</span>
              {selected && selected.label !== "one" ? ` — ${selected.nameAr}` : ""}.
            </p>
          ) : (
            <div className="lg:mt-2 lg:max-w-md">
              <div className="mt-8 flex items-center justify-between">
                <p className="text-[13px] tracking-[0.16em] text-gold">الكمية</p>
                <QuantitySelector value={qty} onChange={setQty} />
              </div>
              <button
                type="button"
                onClick={add}
                disabled={adding}
                className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 bg-gold text-[16px] font-semibold text-black disabled:opacity-80"
              >
                {adding ? (
                  <>
                    <LoaderCircle className="size-5 animate-spin" />
                    جاري الإضافة
                  </>
                ) : added ? (
                  <>
                    <Check className="size-5" /> تمت الإضافة
                  </>
                ) : (
                  `أضف للسلة · ${selected ? formatPrice(selected.price * qty) : ""}`
                )}
              </button>
              <button
                type="button"
                onClick={openCart}
                disabled={openingCart}
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 text-[14px] text-muted"
              >
                {openingCart ? (
                  <>
                    <LoaderCircle className="size-4 animate-spin" />
                    جاري التحميل
                  </>
                ) : (
                  "عرض السلة"
                )}
              </button>
            </div>
          )}
        </section>
      </div>

      {view ? null : <CartBar branchId={branch.id} href={`/${branch.slug}/cart`} />}
    </main>
  );
}
