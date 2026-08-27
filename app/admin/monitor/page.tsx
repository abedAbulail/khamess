import { MonitorPanel } from "@/components/admin/MonitorPanel";
import { listActivity, listAdminUsers, requireAdminPage } from "@/lib/admin-auth";

export default async function AdminMonitorPage() {
  const actor = await requireAdminPage("monitor");
  const [users, activity] = await Promise.all([
    listAdminUsers(actor),
    listActivity(actor),
  ]);
  return <MonitorPanel users={users} activity={activity} />;
}
