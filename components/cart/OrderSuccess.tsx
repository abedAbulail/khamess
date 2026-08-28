"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle, MessageCircle } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { formatPrice } from "@/lib/cn";
import { readLastOrder, type LastOrder } from "@/lib/last-order";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export function OrderSuccess({
  branchSlug,
  branchName,
}: {
  branchSlug: string;
  branchName: string;
}) {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [ready, setReady] = useState(false);
  const [goingBack, setGoingBack] = useState(false);

  useEffect(() => {
    setOrder(readLastOrder(branchSlug));
    setReady(true);
  }, [branchSlug]);

  const whatsappHref = order
    ? getWhatsAppUrl(order.whatsapp, order.message)
    : "";

  return (
    <main className="grid min-h-svh place-items-center bg-black px-5 py-10">
      <div className="w-full max-w-md text-center">
        <Logo className="mx-auto h-20 w-auto" />
        <div className="mx-auto mt-8 grid size-16 place-items-center rounded-full bg-gold text-black">
          <Check className="size-8" strokeWidth={3} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">
          {order || !ready ? "طلبك وصل" : "ما لقينا تفاصيل الطلب"}
        </h1>
        <p className="mt-2 text-[15px] leading-8 text-muted">
          {order
            ? `شكراً ${order.name} — استلمنا طلبك من ${branchName}.`
            : ready
              ? "ارجع للمنيو وكمل الطلب من السلة."
              : `شكراً — استلمنا طلبك من ${branchName}.`}
        </p>
        {order ? (
          <p className="mt-1 text-[15px] font-semibold text-gold">{formatPrice(order.total)}</p>
        ) : null}

        {ready && whatsappHref ? (
          <div className="mt-8 border border-line bg-paper p-5 text-right">
            <p className="text-[16px] font-semibold">بدك الطلب يوصل أسرع؟</p>
            <p className="mt-2 text-[14px] leading-7 text-muted">
              تقدر كمان ترسل طلبك عبر واتساب عشان الفرع يشوفه فوراً ويجهّزه أسرع.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex min-h-14 items-center justify-center gap-2 bg-gold text-[16px] font-semibold text-black"
            >
              <MessageCircle className="size-5" />
              إرسال عبر واتساب
            </a>
          </div>
        ) : null}

        <Link
          href={`/${branchSlug}/menu`}
          onClick={() => setGoingBack(true)}
          className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 text-[15px] text-muted"
        >
          {goingBack ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              جاري التحميل
            </>
          ) : (
            "الرجوع للمنيو"
          )}
        </Link>
      </div>
    </main>
  );
}
