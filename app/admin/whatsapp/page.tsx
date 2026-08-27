import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { requireAdminPage, scopedBranches } from "@/lib/admin-auth";
import { listBranches } from "@/lib/queries";

export default async function AdminWhatsappPage() {
  const actor = await requireAdminPage("settings");
  const branches = scopedBranches(actor, await listBranches());
  return <SettingsPanel branches={branches} />;
}
