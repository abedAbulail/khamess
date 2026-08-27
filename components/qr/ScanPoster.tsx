"use client";

import { QRCodeSVG } from "qrcode.react";
import { Logo } from "@/components/brand/Logo";
import type { Branch } from "@/lib/types";

export function ScanPoster({ branch, url }: { branch: Branch; url: string }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-black px-6 py-10">
      <div className="w-full max-w-md border border-gold/40 bg-black p-8 text-center">
        <Logo className="mx-auto h-28 w-auto" />
        <h1 className="mt-4 text-5xl font-semibold text-gold">امسحني</h1>
        <p className="mt-3 text-[16px] text-muted">{branch.nameAr}</p>
        <div className="mx-auto mt-8 grid place-items-center bg-white p-5">
          <QRCodeSVG value={url} size={220} level="M" />
        </div>
        <p className="mt-6 text-[15px] leading-7 text-muted">
          امسح الرمز لتشوف المنيو على جوالك، وبعدين أخبر النادل بطلبك.
        </p>
      </div>
    </main>
  );
}
