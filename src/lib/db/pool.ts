import { Pool } from "pg";

declare global {
  var pgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/falaa";

const isRemoteDb =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com") ||
  connectionString.includes("sslmode=require") ||
  (process.env.NODE_ENV === "production" && !connectionString.includes("localhost"));

export const pool =
  globalThis.pgPool ||
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.pgPool = pool;
}
