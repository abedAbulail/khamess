import { Overview } from "@/components/admin/Overview";
import { canAccessPage, firstAllowedPath, getAdminSession, scopedBranches, scopedByBranch } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { listBranches, listOrders, listVisits } from "@/lib/queries";
import { redirect } from "next/navigation";

export default async function AdminHomePage() {
  const actor = await getAdminSession();
  if (!actor) redirect("/admin");
  if (!canAccessPage(actor, "dashboard")) {
    const next = firstAllowedPath(actor);
    if (next !== "/admin") redirect(next);
    return (
      <div>
        <h1 className="text-3xl font-semibold">ما عندك صلاحيات</h1>
        <p className="mt-2 text-[15px] text-[var(--admin-muted)]">اطلب من المدير العام تعديل حسابك.</p>
      </div>
    );
  }
  const [visits, orders, branches] = await Promise.all([
    listVisits(),
    listOrders(),
    listBranches(),
  ]);
  return (
    <Overview
      visits={scopedByBranch(actor, visits)}
      orders={scopedByBranch(actor, orders)}
      branches={scopedBranches(actor, branches)}
      databaseReady={Boolean(getDb())}
      canOpenOrders={canAccessPage(actor, "orders")}
      canOpenItems={canAccessPage(actor, "items")}
    />
  );
}
