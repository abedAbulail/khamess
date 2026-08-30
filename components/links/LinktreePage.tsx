"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Download, LoaderCircle, Menu, MessageCircle, Music2, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import type { Branch } from "@/lib/types";
import { VisitTracker } from "@/lib/visit-client";
import { getWhatsAppUrl } from "@/lib/whatsapp";

function branchBackground(slug: Branch["slug"]) {
  return slug === "jenin" ? "/jenin-welcome.jpg" : "/nablus-welcome.jpg";
}

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
  const background = branchBackground(branch.slug);

  useEffect(() => {
    setUrl(window.location.origin + `/${branch.slug}`);
  }, [branch.slug]);

  useEffect(() => {
    const timer = window.setTimeout(() => setWelcome(false), 3200);
    return () => window.clearTimeout(timer);
  }, []);

  const iconLinks = [
    {
      label: "واتساب",
      href: getWhatsAppUrl(branch.whatsapp, `مرحبا، بدي أطلب من فرع ${branch.city}`),
      icon: MessageCircle,
      show: Boolean(branch.whatsapp),
    },
    {
      label: "فيسبوك",
      href: branch.facebook,
      icon: FacebookIcon,
      show: true,
    },
    {
      label: "إنستغرام",
      href: branch.instagram,
      icon: InstagramIcon,
      show: true,
    },
    {
      label: "تيك توك",
      href: branch.tiktok,
      icon: Music2,
      show: true,
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
    <main className="relative min-h-svh overflow-hidden text-ink">
      <VisitTracker page="linktree" branchId={branch.id} />

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={background}
        alt=""
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#050505cc_0%,#05050566_28%,#05050573_62%,#050505e6_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(ellipse_at_top,#e6911033,transparent_70%)]" />

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
            className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 text-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={background} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-black/70" />
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

      <div className="relative z-10 mx-auto flex min-h-svh max-w-md flex-col px-6 pb-8 pt-6">
        <Link
          href="/"
          onClick={() => setGoingBack(true)}
          className="inline-flex min-h-9 w-fit items-center gap-1.5 text-[13px] text-ink/70"
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

        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="size-36 sm:size-40">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="مطعم خميس" className="size-full object-contain" />
          </div>
          <p className="mt-5 text-[16px] font-semibold text-gold">{branch.nameAr}</p>
          <p className="mt-1 text-[13px] text-ink/65">تأسس عام {branch.founded}</p>

          <Link
            href={`/${branch.slug}/menu`}
            onClick={() => setMenuLoading(true)}
            aria-busy={menuLoading}
            className="mt-8 flex min-h-14 w-full items-center justify-start gap-3 rounded-xl bg-gold px-5 text-[17px] font-semibold text-black shadow-[0_10px_28px_rgba(230,145,16,0.28)]"
          >
            <span className="flex items-center gap-3">
              {menuLoading ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Menu className="size-5" />
              )}
              {menuLoading ? "جاري التحميل" : "Menu · قائمة الطعام"}
            </span>
          </Link>

          <div className="mt-6 flex items-center justify-center gap-3">
            {iconLinks.map((link) => {
              const Icon = link.icon;
              const className =
                "grid size-12 place-items-center rounded-full border border-gold/45 bg-black/35 text-gold backdrop-blur-md transition hover:border-gold hover:bg-gold hover:text-black";
              const inner = <Icon className="size-5" />;
              if (!link.href) {
                return (
                  <span key={link.label} aria-label={link.label} className={`${className} opacity-40`}>
                    {inner}
                  </span>
                );
              }
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.label}
                  className={className}
                >
                  {inner}
                </a>
              );
            })}
          </div>
        </div>

        <div id="linktree-qr" className="pointer-events-none fixed -left-[9999px] top-0" aria-hidden>
          <QRCodeCanvas value={url} size={180} includeMargin />
        </div>

        <section className="mt-6">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={downloadQr}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-gold text-[14px] font-semibold text-black"
            >
              <Download className="size-4" />
              تنزيل
            </button>
            <button
              type="button"
              onClick={() => void sharePage()}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-gold/80 bg-black/30 text-[14px] font-semibold text-gold backdrop-blur-md"
            >
              <Share2 className="size-4" />
              مشاركة
            </button>
          </div>
          {shareNote ? <p className="mt-3 text-center text-[12px] text-ink/70">{shareNote}</p> : null}
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
