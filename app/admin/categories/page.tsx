import { CategoriesPanel } from "@/components/admin/CategoriesPanel";
import { requireAdminPage, scopedMenus } from "@/lib/admin-auth";
import { listScopedMenus } from "@/lib/queries";

export default async function AdminCategoriesPage() {
  const actor = await requireAdminPage("categories");
  const menus = scopedMenus(actor, await listScopedMenus());
  return <CategoriesPanel menus={menus} />;
}
