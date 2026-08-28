import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import { siteUrlSync } from "@/lib/site-url";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrlSync()),
  title: "مطاعم خميس",
  description: "منيو فروع نابلس وجنين — اطلب أونلاين أو امسح رمز الطاولة.",
  icons: { icon: "/logo.png" },
  openGraph: {
    title: "مطعم خميس",
    description: "تأسس عام 1968 — فرع نابلس رفيديا وفرع جنين.",
    locale: "ar_AR",
    images: [{ url: "/logo.png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased`}>
      <body className="min-h-full bg-black font-sans text-ink">{children}</body>
    </html>
  );
}
