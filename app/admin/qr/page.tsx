import { QrPanel } from "@/components/admin/QrPanel";
import { requireAdminPage } from "@/lib/admin-auth";
import { siteUrl } from "@/lib/site-url";

export default async function AdminQrPage() {
  const actor = await requireAdminPage("qr");
  return <QrPanel origin={await siteUrl()} branches={actor.branches} fullAccess={actor.role !== "staff"} />;
}
