import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

async function clear() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");
  const sql = neon(url);
  await sql`UPDATE khamis_menu_items SET image_url = ''`;
  console.log("Cleared item images.");
}

clear().catch((error) => {
  console.error(error);
  process.exit(1);
});
