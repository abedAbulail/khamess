import "dotenv/config";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { menuItems } from "./schema";

config({ path: ".env.local" });

const images: Record<string, string> = {
  shakshuka: "/menus/shakshuka.jpg",
  arabic: "/menus/arabic-salad.jpg",
  "cheese-omelette": "/menus/cheese-omelette.jpg",
  "fatteh-nuts": "/menus/fatteh-nuts.jpg",
  mixed: "/menus/cheese-zaatar-manakish.jpg",
  "cheese-manakish": "/menus/cheese-zaatar-manakish.jpg",
  "cheese-green-zaatar": "/menus/cheese-zaatar-manakish.jpg",
  "fatteh-meat": "/menus/fatteh-meat.jpg",
  "hummus-lamb": "/menus/hummus-lamb.jpg",
  omelette: "/menus/omelette.jpg",
  "double-omelette": "/menus/omelette.jpg",
  "fried-cheese": "/menus/fried-cheese.jpg",
  tabbouleh: "/menus/tabbouleh.jpg",
  "tahini-salad": "/menus/tahini-salad.jpg",
  "mashed-potato": "/menus/mashed-potato.jpg",
  "eggplant-mutabbal": "/menus/eggplant-mutabbal.jpg",
  "baba-ghanoush": "/menus/baba-ghanoush.jpg",
  "eggplant-moussaka": "/menus/eggplant-moussaka.jpg",
  "laban-mix": "/menus/laban-mix.jpg",
  coleslaw: "/menus/coleslaw.jpg",
  "turkish-salad": "/menus/turkish-salad.jpg",
  "labneh-arugula": "/menus/labneh-arugula.jpg",
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is missing");

  const db = drizzle(neon(url));
  let total = 0;

  for (const [slug, imageUrl] of Object.entries(images)) {
    const updated = await db
      .update(menuItems)
      .set({ imageUrl })
      .where(eq(menuItems.slug, slug))
      .returning({ id: menuItems.id });
    total += updated.length;
    console.log(`${slug}: ${updated.length}`);
  }

  console.log(`Done. ${total} items updated.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
