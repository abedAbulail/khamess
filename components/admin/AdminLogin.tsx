"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";

export function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        setError("اسم المستخدم أو كلمة السر غلط");
        return;
      }
      router.refresh();
    } catch {
      setError("ما قدرناش ندخل");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-svh place-items-center px-5">
      <form onSubmit={handleSubmit} className="admin-card w-full max-w-sm p-7">
        <Logo className="mx-auto h-24 w-auto" />
        <h1 className="mt-4 text-center text-2xl font-semibold">لوحة التحكم</h1>
        <p className="mt-2 text-center text-[13px] text-[var(--admin-muted)]">
          ادخل لتعديل المنيو ومتابعة الطلبات.
        </p>

        <label className="mt-7 block text-[13px] text-[var(--admin-accent)]">المستخدم</label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="admin-input mt-1"
        />
        <label className="mt-4 block text-[13px] text-[var(--admin-accent)]">كلمة السر</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="admin-input mt-1"
        />
        {error ? <p className="mt-4 text-[13px] text-[var(--admin-danger)]">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="admin-btn admin-btn-primary mt-6 w-full disabled:opacity-60"
        >
          {loading ? "جارٍ الدخول…" : "دخول"}
        </button>
      </form>
    </main>
  );
}
