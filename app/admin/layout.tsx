import { AdminApp } from "@/components/admin/AdminApp";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { getAdminSession } from "@/lib/admin-auth";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const actor = await getAdminSession();
  return (
    <AdminApp authed={Boolean(actor)} actor={actor}>
      {actor ? children : <AdminLogin />}
    </AdminApp>
  );
}
