"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { CartBar } from "@/components/menu/CartBar";
import { hasItemImage, priceLabel } from "@/lib/menu-utils";
import type { BranchMenu, MenuCategory, MenuItem } from "@/lib/types";
import { VisitTracker } from "@/lib/visit-client";

export function MenuPage({
  menu,
  mode,
}: {
  menu: BranchMenu;
  mode: "order" | "view";
}) {
  const [active, setActive] = useState(menu.categories[0]?.id ?? "");
  const [goingBack, setGoingBack] = useState(false);
  const view = mode === "view";
  const categories = useMemo(
    () =>
      menu.categories.filter((category) =>
        category.items.some((item) => item.available || view),
      ),
    [menu.categories, view],
  );
  const menuChunks = interleaveBanners(categories, branchBanners(menu));

  return (
    <main className="min-h-svh bg-black pb-28 text-ink">
      <VisitTracker
        page={view ? "view-menu" : "menu"}
        branchId={menu.id}
        source={view ? "qr-view" : "web"}
      />
      <header className="relative min-h-[22rem] overflow-hidden border-b border-line sm:min-h-[26rem] lg:min-h-[38rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/menu-hero.jpg"
          alt="تاريخ مطعم خميس"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/70 to-black" />
        <div className="relative mx-auto flex min-h-[22rem] max-w-6xl flex-col px-5 pb-8 pt-5 sm:min-h-[26rem] sm:px-8 lg:min-h-[38rem] lg:px-10">
          <div className="flex items-center justify-between">
            <Link
              href={view ? "/" : `/${menu.slug}`}
              onClick={() => setGoingBack(true)}
              className="inline-flex min-h-9 items-center gap-1.5 text-[13px] text-white/80 lg:text-[15px]"
            >
              {goingBack ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  جاري التحميل
                </>
              ) : (
                <>
                  <ArrowRight className="size-4" />
                  {view ? "الفروع" : "الروابط"}
                </>
              )}
            </Link>
            {view ? (
              <span className="border border-gold/40 px-3 py-1 text-[11px] text-gold">
                للعرض داخل المطعم
              </span>
            ) : null}
          </div>
          <div className="mt-auto flex flex-col items-center pb-2 pt-16 text-center">
            <Logo className="h-24 w-auto sm:h-28 lg:h-36" />
            <p className="mt-5 text-[12px] text-gold lg:text-[14px]">
              تأسس عام {menu.founded}
            </p>
            <h1 className="mt-2 text-3xl font-semibold lg:text-5xl">
              Menu
            </h1>
            <p className="mt-1 text-[16px] font-medium text-gold lg:mt-2 lg:text-[20px]">
              قائمة الطعام
            </p>
            <p className="mt-1 text-[14px] text-white/75 lg:mt-3 lg:text-[18px]">{menu.nameAr}</p>
            {view ? (
              <p className="mt-3 max-w-sm text-[13px] leading-6 text-white/70 lg:max-w-md lg:text-[15px]">
                اختر الأصناف وأخبر النادل بالاسم والحجم.
              </p>
            ) : null}
          </div>
        </div>
      </header>

      <CategoryNav
        categories={categories}
        active={active}
        onSelect={(id) => {
          setActive(id);
          document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      {menuChunks.map((chunk, index) =>
        chunk.type === "banner" ? (
          <WelcomeBand key={`banner-${index}`} banner={chunk.banner} />
        ) : (
          <div key={`cats-${index}`} className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:px-10 lg:py-16">
            {chunk.categories.map((category) => (
              <CategoryBlock
                key={category.id}
                category={category}
                menu={menu}
                view={view}
              />
            ))}
          </div>
        ),
      )}

      {view ? null : <CartBar branchId={menu.id} href={`/${menu.slug}/cart`} />}
    </main>
  );
}

function CategoryNav({
  categories,
  active,
  onSelect,
}: {
  categories: MenuCategory[];
  active: string;
  onSelect: (id: string) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(false);

  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    function update() {
      const el = scrollerRef.current;
      if (!el) return;
      const chips = [...el.querySelectorAll<HTMLElement>("[data-cat]")];
      if (!chips.length) {
        setShowLeft(false);
        setShowRight(false);
        return;
      }
      const box = el.getBoundingClientRect();
      const pad = 8;
      const leftmost = Math.min(...chips.map((chip) => chip.getBoundingClientRect().left));
      const rightmost = Math.max(...chips.map((chip) => chip.getBoundingClientRect().right));
      setShowLeft(leftmost < box.left - pad);
      setShowRight(rightmost > box.right + pad);
    }

    update();
    const frame = requestAnimationFrame(update);
    const observer = new ResizeObserver(update);
    observer.observe(root);
    for (const child of root.children) observer.observe(child);
    root.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    void document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [categories]);

  function nudge(side: "left" | "right") {
    const root = scrollerRef.current;
    if (!root) return;
    const box = root.getBoundingClientRect();
    const chips = [...root.querySelectorAll<HTMLElement>("[data-cat]")].sort(
      (a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left,
    );
    const target =
      side === "left"
        ? [...chips].reverse().find((chip) => chip.getBoundingClientRect().left < box.left - 8)
        : chips.find((chip) => chip.getBoundingClientRect().right > box.right + 8);
    target?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-line bg-black/95 backdrop-blur">
      <div className="relative mx-auto max-w-6xl">
        <div
          ref={scrollerRef}
          className="no-scrollbar flex justify-start gap-2.5 overflow-x-auto scroll-px-14 px-4 py-3 sm:gap-3 sm:px-8 lg:px-10 lg:py-4"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              data-cat={category.id}
              onClick={(event) => {
                event.currentTarget.scrollIntoView({
                  inline: "nearest",
                  block: "nearest",
                  behavior: "smooth",
                });
                onSelect(category.id);
              }}
              className={`shrink-0 whitespace-nowrap border px-4 py-2 text-[13px] leading-6 lg:px-5 lg:py-2.5 lg:text-[14px] ${
                active === category.id
                  ? "border-gold bg-gold text-black"
                  : "border-line text-ink"
              }`}
            >
              {category.nameAr}
            </button>
          ))}
        </div>

        {showLeft ? (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-black via-black/85 to-transparent"
              aria-hidden
            />
            <button
              type="button"
              aria-label="تصنيفات سابقة"
              onClick={() => nudge("left")}
              className="absolute left-1 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-gold/50 bg-black text-gold shadow-lg"
            >
              <ChevronLeft className="size-5" strokeWidth={2.5} />
            </button>
          </>
        ) : null}

        {showRight ? (
          <>
            <div
              className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-black via-black/85 to-transparent"
              aria-hidden
            />
            <button
              type="button"
              aria-label="تصنيفات أخرى"
              onClick={() => nudge("right")}
              className="absolute right-1 top-1/2 z-10 grid size-9 -translate-y-1/2 place-items-center rounded-full border border-gold/50 bg-black text-gold shadow-lg"
            >
              <ChevronRight className="size-5" strokeWidth={2.5} />
            </button>
          </>
        ) : null}
      </div>
    </nav>
  );
}

type MenuBanner = {
  src: string;
  alt: string;
  kicker: string;
  title: string;
  text: string;
  objectClass?: string;
};

function branchBanners(menu: BranchMenu): MenuBanner[] {
  const kitchen: MenuBanner[] = [
    {
      src: "/menu-photos/menu-platter.png",
      alt: "سفرة خميس",
      kicker: menu.slug === "jenin" ? "من مطبخ جنين" : "من مطبخ رفيديا",
      title: "على سفرتكم",
      text: "أرز، دجاج مشوي، وخضار طازجة — أكل البيت من مطبخ خميس.",
      objectClass: "object-[center_68%]",
    },
    {
      src: "/menu-photos/menu-salads.png",
      alt: "فرن خميس",
      kicker: "على أصولها",
      title: "من الفرن الحجري",
      text:
        menu.slug === "jenin"
          ? "فخاراتنا تتحمّر على نار الحجر — طعم البيت، من جنين."
          : "فخاراتنا تتحمّر على نار الحجر — طعم البيت، من رفيديا.",
      objectClass: "object-[center_65%]",
    },
    {
      src: "/menu-photos/menu-grill.png",
      alt: "فريق مطعم خميس",
      kicker: "فريق خميس",
      title: "نطبخ لكم كل يوم",
      text: `طقم المطبخ في فرع ${menu.nameAr} جاهز يستقبلكم.`,
      objectClass: "object-[center_68%]",
    },
  ];

  if (menu.slug === "nablus") {
    return [
      {
        src: "/nablus-welcome.jpg",
        alt: "مطعم خميس نابلس رفيديا",
        kicker: "مطعم خميس",
        title: "أهلاً وسهلاً",
        text: `مرحباً بكم في فرع نابلس — رفيديا\n${menu.address}\nتأسس عام ${menu.founded}`,
      },
      ...kitchen,
    ];
  }

  if (menu.slug === "jenin") {
    return [
      {
        src: "/jenin-welcome.jpg",
        alt: "مطعم خميس جنين شارع حيفا",
        kicker: "مطعم خميس",
        title: "أهلاً وسهلاً",
        text: `مرحباً بكم في فرع جنين — شارع حيفا\n${menu.address}\nتأسس عام ${menu.founded}`,
        objectClass: "object-[center_35%]",
      },
      ...kitchen,
    ];
  }

  return [];
}

type MenuChunk =
  | { type: "cats"; categories: MenuCategory[] }
  | { type: "banner"; banner: MenuBanner };

function interleaveBanners(
  categories: MenuCategory[],
  banners: MenuBanner[],
): MenuChunk[] {
  if (!banners.length) {
    return [{ type: "cats", categories }];
  }
  const chunks: MenuChunk[] = [];
  const slots = banners.length + 1;
  const base = Math.floor(categories.length / slots);
  const extra = categories.length % slots;
  let index = 0;
  for (let slot = 0; slot < slots; slot += 1) {
    const size = base + (slot < extra ? 1 : 0);
    if (size > 0) {
      chunks.push({
        type: "cats",
        categories: categories.slice(index, index + size),
      });
      index += size;
    }
    const banner = banners[slot];
    if (banner) {
      chunks.push({ type: "banner", banner });
    }
  }
  return chunks;
}

function WelcomeBand({ banner }: { banner: MenuBanner }) {
  return (
    <section className="relative min-h-[22rem] overflow-hidden sm:min-h-[26rem] lg:min-h-[34rem]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.src}
        alt={banner.alt}
        className={`absolute inset-0 size-full object-cover ${banner.objectClass ?? "object-center"}`}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative mx-auto flex min-h-[22rem] max-w-4xl flex-col items-center justify-center px-6 py-16 text-center sm:min-h-[26rem] lg:min-h-[34rem]">
        <p className="text-[13px] text-gold lg:text-[15px]">{banner.kicker}</p>
        <h2 className="mt-3 text-3xl font-semibold sm:text-4xl lg:text-5xl">{banner.title}</h2>
        <p className="mt-4 max-w-sm whitespace-pre-line text-[16px] leading-8 text-white/85 lg:max-w-lg lg:text-[18px] lg:leading-9">
          {banner.text}
        </p>
      </div>
    </section>
  );
}

function CategoryBlock({
  category,
  menu,
  view,
}: {
  category: MenuCategory;
  menu: BranchMenu;
  view: boolean;
}) {
  return (
    <section id={category.id} className="scroll-mt-24 pb-12 lg:pb-16">
      <div className="flex items-center gap-4">
        <span className="menu-rule h-px flex-1" />
        <h2 className="shrink-0 px-1 text-[16px] font-semibold leading-8 text-gold lg:text-[18px]">
          {category.nameAr}
        </h2>
        <span className="menu-rule h-px flex-1" />
      </div>
      {category.note ? (
        <p className="mt-2 text-center text-[12px] text-muted lg:text-[14px]">{category.note}</p>
      ) : null}
      <div className="mt-6 divide-y divide-line lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:gap-y-0 lg:divide-y-0">
        {category.items
          .filter((item) => item.available || view)
          .map((item, index) => (
            <MenuRow
              key={item.id}
              item={item}
              index={index + 1}
              href={
                view
                  ? `/view/${menu.slug}/${item.slug}`
                  : `/${menu.slug}/menu/${item.slug}`
              }
            />
          ))}
      </div>
    </section>
  );
}

function MenuRow({
  item,
  index,
  href,
}: {
  item: MenuItem;
  index: number;
  href: string;
}) {
  const photo = hasItemImage(item.imageUrl);
  const [opening, setOpening] = useState(false);

  return (
    <Link
      href={href}
      onClick={() => setOpening(true)}
      className="flex items-start gap-4 border-b border-line py-4 transition hover:bg-white/[0.03] lg:border-b lg:py-5"
    >
      <span className="mt-1 w-7 shrink-0 text-[12px] tabular-nums text-gold lg:text-[13px]">
        {String(index).padStart(2, "0")}
      </span>
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt=""
          className="mt-0.5 size-16 shrink-0 object-cover lg:size-20"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 sm:gap-3">
          <h3 className="min-w-0 text-[17px] font-semibold leading-7 lg:text-[19px]">
            {item.nameAr}
          </h3>
          <span className="menu-rule h-px min-w-4 flex-1" />
          <span className="shrink-0 text-[15px] font-semibold leading-7 tabular-nums text-gold lg:text-[17px]">
            {priceLabel(item)}
          </span>
          {opening ? (
            <LoaderCircle className="size-6 shrink-0 animate-spin text-gold" aria-hidden />
          ) : (
            <ChevronLeft className="size-6 shrink-0 text-gold" strokeWidth={2.75} aria-hidden />
          )}
        </div>
        {item.sizes.length > 1 ? (
          <p className="mt-1.5 text-[13px] leading-6 text-muted lg:text-[13px]">
            {item.sizes.map((size) => `${size.nameAr} ${size.price}`).join("  ·  ")}
          </p>
        ) : item.description ? (
          <p className="mt-1.5 text-[13px] leading-6 text-muted lg:text-[13px]">{item.description}</p>
        ) : (
          <p className="mt-1.5 text-[13px] leading-6 text-muted lg:text-[13px]">{item.nameEn}</p>
        )}
      </div>
    </Link>
  );
}
