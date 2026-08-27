import { OrdersPanel } from "@/components/admin/OrdersPanel";
import { requireAdminPage, scopedBranches, scopedByBranch } from "@/lib/admin-auth";
import { listBranches, listOrders } from "@/lib/queries";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string }>;
}) {
  const actor = await requireAdminPage("orders");
  const [{ branch }, orders, allBranches] = await Promise.all([
    searchParams,
    listOrders(),
    listBranches(),
  ]);
  const branches = scopedBranches(actor, allBranches);
  const allowed = scopedByBranch(actor, orders);
  const initialBranch = branches.some((entry) => entry.id === branch)
    ? branch
    : branches.length === 1
      ? branches[0].id
      : null;
  return (
    <OrdersPanel orders={allowed} branches={branches} initialBranch={initialBranch ?? null} />
  );
}
