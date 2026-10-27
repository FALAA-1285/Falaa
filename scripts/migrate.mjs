import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local without external dotenv dependency
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

export async function runMigrations(customPool = null) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment or .env.local.");
  }

  const isRemoteDb =
    connectionString.includes("supabase.co") ||
    connectionString.includes("pooler.supabase.com") ||
    connectionString.includes("sslmode=require") ||
    !connectionString.includes("localhost");

  const pool =
    customPool ||
    new Pool({
      connectionString,
      ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 10000,
    });

  const shouldClosePool = !customPool;

  try {
    console.log("==============================================");
    console.log("🚀 Running Database Migrations...");
    console.log("==============================================");

    // 1. Ensure migrations tracking table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Fetch already applied migrations
    const { rows: appliedRows } = await pool.query(
      `SELECT name FROM public.schema_migrations ORDER BY id ASC`
    );
    const appliedSet = new Set(appliedRows.map((r) => r.name));

    // 3. Read migration files from migrations directory
    const migrationsDir = path.resolve(process.cwd(), "migrations");
    if (!fs.existsSync(migrationsDir)) {
      console.log("ℹ️ No migrations directory found. Skipping.");
      return { totalApplied: 0, appliedMigrations: [] };
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const newlyApplied = [];

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log(`  ⏩ [Already Applied] ${file}`);
        continue;
      }

      console.log(`  ⏳ [Applying] ${file}...`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, "utf8");

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        await client.query(sqlContent);
        await client.query(
          `INSERT INTO public.schema_migrations (name) VALUES ($1)`,
          [file]
        );
        await client.query("COMMIT");
        console.log(`  ✅ [Applied] ${file}`);
        newlyApplied.push(file);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`  ❌ [FAILED] ${file}:`, err.message);
        throw err;
      } finally {
        client.release();
      }
    }

    console.log("----------------------------------------------");
    if (newlyApplied.length === 0) {
      console.log("✨ All migrations are up to date! (0 new migrations)");
    } else {
      console.log(`🎉 Successfully applied ${newlyApplied.length} new migration(s)!`);
    }
    console.log("==============================================\n");

    return { totalApplied: newlyApplied.length, appliedMigrations: newlyApplied };
  } finally {
    if (shouldClosePool) {
      await pool.end();
    }
  }
}

// Allow direct CLI invocation
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
