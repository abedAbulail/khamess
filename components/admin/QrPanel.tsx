"use client";

import { QRCodeCanvas } from "qrcode.react";
import { qrCatalog } from "@/lib/qr";

function downloadCanvas(id: string, name: string) {
  const canvas = document.querySelector(
    `#qr-wrap-${id} canvas`,
  ) as HTMLCanvasElement | null;
  if (!canvas) return;
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = `${name}.png`;
  link.click();
}

export function QrPanel({
  origin,
  branches,
  fullAccess,
}: {
  origin: string;
  branches: string[];
  fullAccess: boolean;
}) {
  const codes = qrCatalog(origin).filter((code) => {
    if (fullAccess || branches.length >= 2) return true;
    if (code.id === "home") return false;
    return branches.some((branch) => code.id.startsWith(branch) || code.path.includes(`/${branch}`));
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold">رموز QR</h1>
      <p className="mt-2 text-[14px] text-[var(--admin-muted)]">
        نزّل الرموز للطباعة. رمز الطاولة هو اللي ينحط على الطاولات — المنيو للعرض فقط بدون سلة.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {codes.map((code) => (
          <article key={code.id} className="admin-card p-5">
            <h3 className="font-semibold">{code.titleAr}</h3>
            <p className="mt-1 text-[13px] text-[var(--admin-muted)]">{code.hint}</p>
            <div className="mt-4 grid place-items-center rounded-xl bg-white p-4" id={`qr-wrap-${code.id}`}>
              <QRCodeCanvas value={code.url} size={180} includeMargin />
            </div>
            <p className="mt-3 break-all text-center text-[11px] text-[var(--admin-muted)]" dir="ltr">
              {code.url}
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => downloadCanvas(code.id, code.id)}
                className="admin-btn admin-btn-primary min-h-10 flex-1"
              >
                تنزيل PNG
              </button>
              {code.path.startsWith("/view/") ? (
                <a
                  href={`/scan/${code.path.replace("/view/", "")}`}
                  className="admin-btn admin-btn-ghost grid min-h-10 flex-1 place-items-center"
                >
                  لوحة امسحني
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
