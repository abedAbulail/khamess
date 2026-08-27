import { UsersPanel } from "@/components/admin/UsersPanel";
import { listAdminUsers, requireAdminPage } from "@/lib/admin-auth";

export default async function AdminUsersPage() {
  const actor = await requireAdminPage("users");
  const users = await listAdminUsers(actor);
  return <UsersPanel users={users} actor={actor} />;
}
