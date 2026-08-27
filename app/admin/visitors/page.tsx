import { VisitorsPanel } from "@/components/admin/VisitorsPanel";
import { requireAdminPage, scopedByBranch } from "@/lib/admin-auth";
import { listVisits } from "@/lib/queries";

export default async function AdminVisitorsPage() {
  const actor = await requireAdminPage("visitors");
  const visits = scopedByBranch(actor, await listVisits());
  return <VisitorsPanel visits={visits} />;
}
