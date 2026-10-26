import { Pool } from "pg";

declare global {
  var pgPool: Pool | undefined;
}

export const pool =
  globalThis.pgPool ||
  new Pool({
    connectionString:
      process.env.DATABASE_URL || "postgresql://postgres@localhost:5432/falaa",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.pgPool = pool;
}
