import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Read .env.local without external dotenv dependency
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...rest] = trimmed.split("=");
        if (key && rest.length > 0 && !process.env[key.trim()]) {
          process.env[key.trim()] = rest.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;

console.log("\n==============================================");
console.log("🔍 Testing Database Connection...");
console.log("==============================================");

if (!connectionString) {
  console.error("❌ DATABASE_URL is not defined in .env.local!");
  process.exit(1);
}

const isRemoteDb =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com") ||
  connectionString.includes("sslmode=require") ||
  !connectionString.includes("localhost");

console.log("Host Type:", isRemoteDb ? "Remote (Supabase / Cloud)" : "Local (Laragon / PostgreSQL)");
console.log("Connection URL:", connectionString.replace(/:([^:@]+)@/, ":****@"));

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10000,
  ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
});

async function main() {
  try {
    const timeRes = await pool.query("SELECT NOW() as current_time, version() as pg_version");
    console.log("✅ Berhasil terhubung ke database!");
    console.log("⏰ Server Time:", timeRes.rows[0].current_time);
    console.log("📦 Version:", timeRes.rows[0].pg_version.slice(0, 50) + "...");

    const tables = ["profile_info", "projects", "experiences", "skills", "messages"];
    console.log("\n📊 Memeriksa data tabel:");
    for (const table of tables) {
      try {
        const count = await pool.query(`SELECT COUNT(*) FROM "${table}"`);
        console.log(`  - ${table.padEnd(15)}: ${count.rows[0].count} baris`);
      } catch (err) {
        console.log(`  - ${table.padEnd(15)}: ⚠️ Tabel belum dibuat`);
      }
    }
    console.log("\n✨ Database siap digunakan!");
  } catch (err) {
    console.error("❌ Gagal terhubung ke database:", err.message);
  } finally {
    await pool.end();
  }
}

main();
