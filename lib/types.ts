export type BranchSlug = "nablus" | "jenin";
export type MenuChannel = "inside" | "outside";

export type ItemSize = {
  id: string;
  itemId: string;
  label: string;
  nameAr: string;
  price: number;
  sortOrder: number;
};

export type MenuItem = {
  id: string;
  branchId: string;
  categoryId: string;
  channel: MenuChannel;
  nameAr: string;
  nameEn: string;
  description: string;
  slug: string;
  imageUrl: string;
  available: boolean;
  sortOrder: number;
  sizes: ItemSize[];
};

export type MenuCategory = {
  id: string;
  branchId: string;
  channel: MenuChannel;
  nameAr: string;
  slug: string;
  note: string | null;
  sortOrder: number;
  items: MenuItem[];
};

export type Branch = {
  id: string;
  slug: BranchSlug;
  nameAr: string;
  nameEn: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  tiktok: string;
  heroImage: string;
  founded: string;
  sortOrder: number;
};

export type BranchMenu = Branch & {
  channel: MenuChannel;
  menuKey: string;
  categories: MenuCategory[];
};

export type CartLine = {
  key: string;
  itemId: string;
  branchId: string;
  slug: string;
  nameAr: string;
  imageUrl: string;
  sizeId: string;
  sizeLabel: string;
  sizeNameAr: string;
  price: number;
  quantity: number;
};

export type OrderRecord = {
  id: string;
  branchId: string;
  customerName: string;
  phone: string;
  notes: string | null;
  subtotal: number;
  status: string;
  source: string;
  createdAt: Date | string;
  items: Array<{
    id: string;
    nameAr: string;
    sizeLabel: string;
    quantity: number;
    price: number;
  }>;
};

export type VisitRecord = {
  id: string;
  branchId: string | null;
  page: string;
  source: string;
  createdAt: Date | string;
};
