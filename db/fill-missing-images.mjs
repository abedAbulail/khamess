import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
const sql = neon(process.env.DATABASE_URL);

const photos = {
  hummus: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=1200&q=80",
  salad: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80",
  grill: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1200&q=80",
  lamb: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=1200&q=80",
  chicken: "https://images.unsplash.com/photo-1532550907401-a532c00947da?auto=format&fit=crop&w=1200&q=80",
  mansaf: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80",
  pasta: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=1200&q=80",
  manakish: "/menus/cheese-zaatar-manakish.jpg",
  pizza: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1200&q=80",
  falafel: "https://images.unsplash.com/photo-1593001872095-7d5b3946ee0b?auto=format&fit=crop&w=1200&q=80",
  eggs: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
  potatoes: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?auto=format&fit=crop&w=1200&q=80",
  coffee: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
  juice: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=1200&q=80",
  tea: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80",
  wrap: "https://images.unsplash.com/photo-1529006557810-274b0fa89fc1?auto=format&fit=crop&w=1200&q=80",
  labneh: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?auto=format&fit=crop&w=1200&q=80",
  fatteh: "/menus/fatteh-meat.jpg",
  cheese: "https://images.unsplash.com/photo-1452195106916-7107a234847a?auto=format&fit=crop&w=1200&q=80",
  pickles: "https://images.unsplash.com/photo-1589621316382-008455b857cd?auto=format&fit=crop&w=1200&q=80",
};

function imageFor(item) {
  const slug = item.slug.toLowerCase();
  const category = item.category_slug.toLowerCase();
  const name = item.name_en.toLowerCase();
  if (category === "drinks") {
    if (slug.includes("coffee")) return photos.coffee;
    if (slug === "tea") return photos.tea;
    if (slug === "water" || slug === "cola") return photos.juice;
    return photos.juice;
  }
  if (category === "pizza" || slug === "pizza") return photos.pizza;
  if (["pastries", "manaqish"].includes(category)) return photos.manakish;
  if (category === "sandwiches") {
    if (slug.includes("falafel")) return photos.falafel;
    if (slug.includes("labneh")) return photos.labneh;
    if (slug.includes("omelette")) return photos.eggs;
    return photos.wrap;
  }
  if (category === "salads" || category === "dips" || slug.includes("salad") || slug.includes("mutabbal") || slug.includes("avocado")) return photos.salad;
  if (slug.includes("fatteh")) return photos.fatteh;
  if (slug.includes("hummus") || slug.includes("foul") || slug.includes("musabaha") || slug.includes("qudsia")) return photos.hummus;
  if (slug.includes("falafel") || slug.includes("kibbeh")) return photos.falafel;
  if (slug.includes("egg") || slug.includes("omelette")) return photos.eggs;
  if (slug.includes("potato")) return photos.potatoes;
  if (slug.includes("cheese")) return photos.cheese;
  if (slug.includes("manakish") || slug.includes("zaatar") || category === "manaqish") return photos.manakish;
  if (slug.includes("fettuccine")) return photos.pasta;
  if (slug.includes("mansaf")) return photos.mansaf;
  if (slug.includes("lamb") || slug.includes("kebab") || slug.includes("meat") || slug.includes("liver")) return photos.lamb;
  if (slug.includes("chicken") || slug.includes("tawook") || slug === "bbq") return photos.chicken;
  if (slug.includes("tomato") || slug.includes("mixed-fried") || slug.includes("sausage")) return photos.grill;
  if (slug.includes("pickles")) return photos.pickles;
  if (category === "mains") return photos.grill;
  if (category === "boxes" || category === "plates") return photos.hummus;
  if (name.includes("salad")) return photos.salad;
  return photos.grill;
}

const missing = await sql`SELECT m.id, m.slug, m.name_en, c.slug AS category_slug FROM khamis_menu_items m JOIN khamis_categories c ON m.category_id = c.id WHERE COALESCE(BTRIM(m.image_url), '') = ''`;
let updated = 0;
for (const item of missing) {
  const imageUrl = imageFor(item);
  await sql`UPDATE khamis_menu_items SET image_url = ${imageUrl} WHERE id = ${item.id} AND COALESCE(BTRIM(image_url), '') = ''`;
  updated++;
}
const [{ remaining }] = await sql`SELECT COUNT(*)::int AS remaining FROM khamis_menu_items WHERE COALESCE(BTRIM(image_url), '') = ''`;
console.log(`Filled ${updated} menu item images. Blank image fields remaining: ${remaining}.`);
