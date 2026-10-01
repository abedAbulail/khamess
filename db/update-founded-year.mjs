import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
const sql = neon(process.env.DATABASE_URL);
const result = await sql`UPDATE khamis_branches SET founded = '1953' RETURNING slug`;
console.log(`Updated founding year to 1953 for ${result.length} branches.`);
