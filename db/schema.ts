import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const branches = pgTable("khamis_branches", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  facebook: text("facebook").notNull().default(""),
  instagram: text("instagram").notNull().default(""),
  tiktok: text("tiktok").notNull().default(""),
  heroImage: text("hero_image").notNull(),
  founded: text("founded").notNull().default("1968"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const categories = pgTable("khamis_categories", {
  id: text("id").primaryKey(),
  branchId: text("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  channel: text("channel").notNull().default("outside"),
  nameAr: text("name_ar").notNull(),
  slug: text("slug").notNull(),
  note: text("note"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const menuItems = pgTable("khamis_menu_items", {
  id: text("id").primaryKey(),
  branchId: text("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id, { onDelete: "cascade" }),
  channel: text("channel").notNull().default("outside"),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  description: text("description").notNull().default(""),
  slug: text("slug").notNull(),
  imageUrl: text("image_url").notNull(),
  available: boolean("available").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const itemSizes = pgTable("khamis_item_sizes", {
  id: text("id").primaryKey(),
  itemId: text("item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  nameAr: text("name_ar").notNull(),
  price: integer("price").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const itemPhotos = pgTable("khamis_item_photos", {
  itemId: text("item_id")
    .primaryKey()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  mime: text("mime").notNull(),
  data: text("data").notNull(),
});

export const orders = pgTable("khamis_orders", {
  id: text("id").primaryKey(),
  branchId: text("branch_id")
    .notNull()
    .references(() => branches.id),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  notes: text("notes"),
  subtotal: integer("subtotal").notNull(),
  status: text("status").notNull().default("new"),
  source: text("source").notNull().default("whatsapp"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("khamis_order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  itemId: text("item_id"),
  nameAr: text("name_ar").notNull(),
  sizeLabel: text("size_label").notNull(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
});

export const visits = pgTable("khamis_visits", {
  id: text("id").primaryKey(),
  branchId: text("branch_id"),
  page: text("page").notNull(),
  source: text("source").notNull().default("web"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const adminUsers = pgTable("khamis_admin_users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("staff"),
  pages: text("pages").notNull().default("[]"),
  branches: text("branches").notNull().default("[]"),
  active: boolean("active").notNull().default(true),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
});

export const adminActivity = pgTable("khamis_admin_activity", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  role: text("role").notNull().default("staff"),
  action: text("action").notNull(),
  page: text("page").notNull().default(""),
  detail: text("detail").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
