import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { runMigrations } from "./migrate.mjs";

function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const envPath = path.resolve(process.cwd(), file);
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
}

loadEnv();

async function main() {
  console.log("==============================================");
  console.log("🌱 Initializing FALAH Portfolio Database...");
  console.log("==============================================");

  // 1. Run migrations first to ensure all tables, columns, indexes, and RLS exist
  await runMigrations();

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const isRemoteDb =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com") ||
    connectionString.includes("sslmode=require") ||
    !connectionString.includes("localhost");

  const pool = new Pool({
    connectionString,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
    connectionTimeoutMillis: 10000,
  });

  try {
    // 2. Check if seeding is required
    const profileRes = await pool.query("SELECT COUNT(*) FROM public.profile_info");
    const projectsRes = await pool.query("SELECT COUNT(*) FROM public.projects");
    const skillsRes = await pool.query("SELECT COUNT(*) FROM public.skills");

    const profileCount = parseInt(profileRes.rows[0].count, 10);
    const projectsCount = parseInt(projectsRes.rows[0].count, 10);
    const skillsCount = parseInt(skillsRes.rows[0].count, 10);

    console.log("📊 Current Table Statistics:");
    console.log(`  - profile_info : ${profileCount} row(s)`);
    console.log(`  - projects     : ${projectsCount} row(s)`);
    console.log(`  - skills       : ${skillsCount} row(s)`);

    // The seed uses ON CONFLICT ... DO UPDATE, so re-running it would overwrite content edited
    // through the CMS. Only seed a database that has never been initialized (no profile row).
    if (profileCount > 0) {
      console.log("\n✅ Database already initialized. Seeding skipped to preserve existing content.");
      console.log("✨ Database initialization complete!");
      return;
    }

    // 3. Read seed SQL from supabase-schema.sql if tables need seeding
    const schemaFile = path.resolve(process.cwd(), "supabase-schema.sql");
    if (fs.existsSync(schemaFile)) {
      console.log("\n🌱 Seeding initial portfolio content from supabase-schema.sql...");
      const fullSql = fs.readFileSync(schemaFile, "utf8");
      
      // Extract seeding section (after INITIAL DATA SEEDING header)
      const seedMarker = "-- INITIAL DATA SEEDING";
      const markerIndex = fullSql.indexOf(seedMarker);
      if (markerIndex !== -1) {
        const seedSql = fullSql.slice(markerIndex);
        const client = await pool.connect();
        try {
          await client.query("BEGIN");
          await client.query(seedSql);
          await client.query("COMMIT");
        } catch (seedErr) {
          await client.query("ROLLBACK");
          throw seedErr;
        } finally {
          client.release();
        }
        console.log("✅ Initial seed data applied successfully!");
      }
    }

    console.log("==============================================");
    console.log("✨ Database initialization finished successfully!");
    console.log("==============================================\n");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
