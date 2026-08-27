import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function push() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  const sql = neon(url);

  await sql`CREATE TABLE IF NOT EXISTS khamis_branches (
    id text PRIMARY KEY,
    slug text NOT NULL UNIQUE,
    name_ar text NOT NULL,
    name_en text NOT NULL,
    city text NOT NULL,
    address text NOT NULL,
    phone text NOT NULL,
    whatsapp text NOT NULL,
    facebook text NOT NULL DEFAULT '',
    instagram text NOT NULL DEFAULT '',
    tiktok text NOT NULL DEFAULT '',
    hero_image text NOT NULL,
    founded text NOT NULL DEFAULT '1968',
    sort_order integer NOT NULL DEFAULT 0
  )`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_categories (
    id text PRIMARY KEY,
    branch_id text NOT NULL REFERENCES khamis_branches(id) ON DELETE CASCADE,
    channel text NOT NULL DEFAULT 'outside',
    name_ar text NOT NULL,
    slug text NOT NULL,
    note text,
    sort_order integer NOT NULL DEFAULT 0
  )`;
  await sql`ALTER TABLE khamis_categories ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'outside'`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_menu_items (
    id text PRIMARY KEY,
    branch_id text NOT NULL REFERENCES khamis_branches(id) ON DELETE CASCADE,
    category_id text NOT NULL REFERENCES khamis_categories(id) ON DELETE CASCADE,
    channel text NOT NULL DEFAULT 'outside',
    name_ar text NOT NULL,
    name_en text NOT NULL,
    description text NOT NULL DEFAULT '',
    slug text NOT NULL,
    image_url text NOT NULL,
    available boolean NOT NULL DEFAULT true,
    sort_order integer NOT NULL DEFAULT 0
  )`;
  await sql`ALTER TABLE khamis_menu_items ADD COLUMN IF NOT EXISTS channel text NOT NULL DEFAULT 'outside'`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_item_sizes (
    id text PRIMARY KEY,
    item_id text NOT NULL REFERENCES khamis_menu_items(id) ON DELETE CASCADE,
    label text NOT NULL,
    name_ar text NOT NULL,
    price integer NOT NULL,
    sort_order integer NOT NULL DEFAULT 0
  )`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_orders (
    id text PRIMARY KEY,
    branch_id text NOT NULL REFERENCES khamis_branches(id),
    customer_name text NOT NULL,
    phone text NOT NULL,
    notes text,
    subtotal integer NOT NULL,
    status text NOT NULL DEFAULT 'new',
    source text NOT NULL DEFAULT 'whatsapp',
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_order_items (
    id text PRIMARY KEY,
    order_id text NOT NULL REFERENCES khamis_orders(id) ON DELETE CASCADE,
    item_id text,
    name_ar text NOT NULL,
    size_label text NOT NULL,
    quantity integer NOT NULL,
    price integer NOT NULL
  )`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_item_photos (
    item_id text PRIMARY KEY REFERENCES khamis_menu_items(id) ON DELETE CASCADE,
    mime text NOT NULL,
    data text NOT NULL
  )`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_visits (
    id text PRIMARY KEY,
    branch_id text,
    page text NOT NULL,
    source text NOT NULL DEFAULT 'web',
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_admin_users (
    id text PRIMARY KEY,
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    display_name text NOT NULL,
    role text NOT NULL DEFAULT 'staff',
    pages text NOT NULL DEFAULT '[]',
    branches text NOT NULL DEFAULT '[]',
    active boolean NOT NULL DEFAULT true,
    created_by text,
    created_at timestamptz NOT NULL DEFAULT now(),
    last_login_at timestamptz,
    last_seen_at timestamptz
  )`;

  await sql`CREATE TABLE IF NOT EXISTS khamis_admin_activity (
    id text PRIMARY KEY,
    user_id text NOT NULL,
    username text NOT NULL,
    role text NOT NULL DEFAULT 'staff',
    action text NOT NULL,
    page text NOT NULL DEFAULT '',
    detail text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
  )`;

  console.log("Khamis tables are ready.");
}

push().catch((error) => {
  console.error(error);
  process.exit(1);
});
