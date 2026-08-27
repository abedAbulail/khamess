import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3001");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
