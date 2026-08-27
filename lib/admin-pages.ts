export const STAFF_PAGE_IDS = [
  "dashboard",
  "categories",
  "items",
  "orders",
  "visitors",
  "qr",
  "settings",
] as const;

export const SUPER_PAGE_IDS = ["users", "monitor"] as const;

export type StaffPageId = (typeof STAFF_PAGE_IDS)[number];
export type SuperPageId = (typeof SUPER_PAGE_IDS)[number];
export type AdminPageId = StaffPageId | SuperPageId;
export type AdminRole = "dev" | "super" | "staff";
export type AdminBranchId = "nablus" | "jenin";

export const STAFF_PAGES: Array<{ id: StaffPageId; href: string; label: string }> = [
  { id: "dashboard", href: "/admin", label: "الرئيسية" },
  { id: "categories", href: "/admin/categories", label: "التصنيفات" },
  { id: "items", href: "/admin/items", label: "الأصناف" },
  { id: "orders", href: "/admin/orders", label: "الطلبات" },
  { id: "visitors", href: "/admin/visitors", label: "الزوار" },
  { id: "qr", href: "/admin/qr", label: "رموز QR" },
  { id: "settings", href: "/admin/whatsapp", label: "الإعدادات" },
];

export const SUPER_PAGES: Array<{ id: SuperPageId; href: string; label: string }> = [
  { id: "users", href: "/admin/users", label: "المستخدمون" },
  { id: "monitor", href: "/admin/monitor", label: "المراقبة" },
];

export type AdminActor = {
  id: string;
  username: string;
  displayName: string;
  role: AdminRole;
  pages: StaffPageId[];
  branches: AdminBranchId[];
};

export function isStaffPageId(value: string): value is StaffPageId {
  return (STAFF_PAGE_IDS as readonly string[]).includes(value);
}

export function isAdminBranchId(value: string): value is AdminBranchId {
  return value === "nablus" || value === "jenin";
}

export function isFullAdmin(actor: Pick<AdminActor, "role">) {
  return actor.role === "dev" || actor.role === "super";
}

export function canAccessPage(actor: AdminActor, page: AdminPageId) {
  if (page === "users" || page === "monitor") return isFullAdmin(actor);
  if (isFullAdmin(actor)) return true;
  return actor.pages.includes(page as StaffPageId);
}

export function canAccessBranch(actor: AdminActor, branchId: string) {
  if (isFullAdmin(actor)) return true;
  return actor.branches.includes(branchId as AdminBranchId);
}

export function firstAllowedPath(actor: AdminActor) {
  if (isFullAdmin(actor) || actor.pages.includes("dashboard")) return "/admin";
  const page = STAFF_PAGES.find((entry) => actor.pages.includes(entry.id));
  return page?.href ?? "/admin";
}

export function roleLabel(role: AdminRole) {
  if (role === "dev") return "مطوّر";
  if (role === "super") return "مدير عام";
  return "مستخدم";
}

export const ACTION_LABELS: Record<string, string> = {
  login: "دخول",
  logout: "خروج",
  create_user: "إنشاء مستخدم",
  update_user: "تعديل مستخدم",
  toggle_user: "تغيير حالة مستخدم",
  create_category: "إضافة تصنيف",
  update_category: "تعديل تصنيف",
  delete_category: "حذف تصنيف",
  create_item: "إضافة صنف",
  update_item: "تعديل صنف",
  delete_item: "حذف صنف",
  upload_image: "رفع صورة",
  update_order: "تحديث طلب",
  update_branch: "تعديل إعدادات فرع",
};

export const PAGE_LABELS: Record<string, string> = {
  dashboard: "الرئيسية",
  categories: "التصنيفات",
  items: "الأصناف",
  orders: "الطلبات",
  visitors: "الزوار",
  qr: "رموز QR",
  settings: "الإعدادات",
  users: "المستخدمون",
  monitor: "المراقبة",
  login: "تسجيل الدخول",
};
