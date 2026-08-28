"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Download, LoaderCircle, Menu, MessageCircle, Music2, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { Branch } from "@/lib/types";
import { VisitTracker } from "@/lib/visit-client";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function LinktreePage({
  branch,
  pageUrl,
}: {
  branch: Branch;
  pageUrl: string;
}) {
  const [url, setUrl] = useState(pageUrl);
  const [shareNote, setShareNote] = useState("");
  const [welcome, setWelcome] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [goingBack, setGoingBack] = useState(false);

  useEffect(() => {
    setUrl(window.location.origin + `/${branch.slug}`);
  }, [branch.slug]);

  useEffect(() => {
    const timer = window.setTimeout(() => setWelcome(false), 3200);
    return () => window.clearTimeout(timer);
  }, []);

  const links = [
    {
      label: "المنيو",
      href: `/${branch.slug}/menu`,
      icon: Menu,
      primary: true,
      show: true,
    },
    {
      label: "واتساب",
      href: getWhatsAppUrl(branch.whatsapp, `مرحبا، بدي أطلب من فرع ${branch.city}`),
      icon: MessageCircle,
      primary: false,
      show: Boolean(branch.whatsapp),
      external: true,
    },
    {
      label: "فيسبوك",
      href: branch.facebook,
      icon: FacebookIcon,
      show: true,
      external: true,
    },
    {
      label: "إنستغرام",
      href: branch.instagram,
      icon: InstagramIcon,
      show: true,
      external: true,
    },
    {
      label: "تيك توك",
      href: branch.tiktok,
      icon: Music2,
      show: true,
      external: true,
    },
  ].filter((link) => link.show);

  function downloadQr() {
    const canvas = document.querySelector("#linktree-qr canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `khamis-${branch.slug}-qr.png`;
    link.click();
  }

  async function sharePage() {
    const payload = {
      title: `مطعم خميس — ${branch.nameAr}`,
      text: `منيو وروابط فرع ${branch.nameAr}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
    } catch {
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareNote("تم نسخ الرابط");
    } catch {
      setShareNote(url);
    }
    window.setTimeout(() => setShareNote(""), 2500);
  }

  return (
    <main className="relative min-h-svh bg-black text-ink">
      <VisitTracker page="linktree" branchId={branch.id} />

      <AnimatePresence>
        {welcome ? (
          <motion.button
            type="button"
            key="welcome"
            onClick={() => setWelcome(false)}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black px-8 text-center"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#e6911033_0%,#e6911014_40%,transparent_100%)]" />
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="relative flex flex-col items-center"
            >
              <div className="size-44 sm:size-52">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="مطعم خميس" className="size-full object-contain" />
              </div>
              <p className="mt-8 text-[14px] font-medium text-gold">مطعم خميس</p>
              <h1 className="mt-3 text-3xl font-semibold">أهلاً وسهلاً</h1>
              <p className="mt-3 max-w-xs text-[16px] leading-8 text-muted">
                مرحباً بكم في فرع {branch.city}
                <br />
                {branch.nameAr}
              </p>
              <p className="mt-8 text-[12px] text-gold/80">اضغط للمتابعة</p>
            </motion.div>
          </motion.button>
        ) : null}
      </AnimatePresence>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,#e6911033_0%,#e691101a_28%,#e691100d_52%,transparent_100%)]" />
        <div className="relative mx-auto max-w-md px-6 pb-10 pt-8">
          <Link
            href="/"
            onClick={() => setGoingBack(true)}
            className="inline-flex min-h-9 items-center gap-1.5 text-[13px] text-muted"
          >
            {goingBack ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                جاري التحميل
              </>
            ) : (
              "← كل الفروع"
            )}
          </Link>
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="size-48 sm:size-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="مطعم خميس" className="size-full object-contain" />
            </div>
            <p className="mt-5 text-[15px] font-semibold text-gold">{branch.nameAr}</p>
            <p className="mt-1 text-[13px] text-muted">
              تأسس عام {branch.founded}
            </p>
          </div>
        </div>
      </section>

      <div className="relative mx-auto max-w-md px-6 pb-10">
        <div className="flex flex-col gap-3">
          {links.map((link) => {
            const Icon = link.icon;
            const className = link.primary
              ? "flex min-h-14 items-center justify-start gap-3 bg-gold px-5 text-[17px] font-semibold text-black"
              : "flex min-h-14 items-center justify-start gap-3 border border-line bg-paper px-5 text-[16px]";
            const inner = (
              <span className="flex items-center gap-3">
                {link.primary && menuLoading ? (
                  <LoaderCircle className="size-5 animate-spin" />
                ) : (
                  <Icon className="size-5" />
                )}
                {link.primary && menuLoading ? "جاري التحميل" : link.label}
              </span>
            );
            if (link.external && !link.href) {
              return (
                <div key={link.label} className={`${className} opacity-50`}>
                  {inner}
                </div>
              );
            }
            return link.external ? (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer" className={className}>
                {inner}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => {
                  if (link.primary) setMenuLoading(true);
                }}
                className={className}
                aria-busy={link.primary ? menuLoading : undefined}
              >
                {inner}
              </Link>
            );
          })}
        </div>

        <section className="mt-10 border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/history.jpg" alt="تاريخ مطعم خميس" className="h-44 w-full object-cover opacity-80" />
          <div className="p-5">
            <p className="text-[13px] text-gold">منذ ١٩٦٨</p>
            <p className="mt-2 text-[14px] leading-7 text-muted">
              مطعم خميس — حمص، إفطار، مشاوي، ومعجنات في نابلس وجنين.
            </p>
            <p className="mt-3 text-[13px] text-gold" dir="ltr">
              {branch.phone}
            </p>
          </div>
        </section>

        <section className="mt-8 border border-line bg-paper p-5 text-center">
          <p className="text-[13px] text-gold">رمز الفرع</p>
          <div id="linktree-qr" className="mx-auto mt-4 grid w-fit place-items-center bg-white p-3">
            <QRCodeCanvas value={url} size={180} includeMargin />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadQr}
              className="inline-flex min-h-12 items-center justify-center gap-2 bg-gold text-[14px] font-semibold text-black"
            >
              <Download className="size-4" />
              تنزيل
            </button>
            <button
              type="button"
              onClick={() => void sharePage()}
              className="inline-flex min-h-12 items-center justify-center gap-2 border border-gold text-[14px] font-semibold text-gold"
            >
              <Share2 className="size-4" />
              مشاركة
            </button>
          </div>
          {shareNote ? <p className="mt-3 text-[12px] text-muted">{shareNote}</p> : null}
        </section>
      </div>
    </main>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h3l1-3h-4v-2c0-.6.4-1 1-1z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
