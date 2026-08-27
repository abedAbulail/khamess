import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <main className="grid min-h-svh place-items-center bg-black p-8 text-center">
      <div>
        <Logo className="mx-auto h-24 w-auto" />
        <h1 className="mt-6 text-3xl font-semibold">الصفحة مش موجودة</h1>
        <Link href="/" className="mt-6 inline-block text-gold">
          ارجع لاختيار الفرع
        </Link>
      </div>
    </main>
  );
}
