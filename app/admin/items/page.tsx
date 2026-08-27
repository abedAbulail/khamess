import { ItemsPanel } from "@/components/admin/ItemsPanel";
import { requireAdminPage, scopedMenus } from "@/lib/admin-auth";
import { listScopedMenus } from "@/lib/queries";

export default async function AdminItemsPage() {
  const actor = await requireAdminPage("items");
  const menus = scopedMenus(actor, await listScopedMenus());
  return <ItemsPanel menus={menus} />;
}
