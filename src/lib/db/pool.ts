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

function resolveSslConfig(isRemote: boolean) {
  if (!isRemote) return undefined;

  // If CA certificate is provided, strictly enforce TLS certificate authenticity
  if (process.env.DB_CA_CERT) {
    return {
      rejectUnauthorized: true,
      ca: process.env.DB_CA_CERT,
    };
  }

  // Allow opt-in strict TLS enforcement
  if (process.env.DB_STRICT_SSL === "true") {
    return {
      rejectUnauthorized: true,
    };
  }

  // Remote cloud databases require TLS encryption
  return {
    rejectUnauthorized: false,
  };
}

const poolSize = parseInt(process.env.PG_MAX_POOL_SIZE || "5", 10);

export const pool =
  globalThis.pgPool ||
  new Pool({
    connectionString,
    max: isNaN(poolSize) ? 5 : poolSize,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ssl: resolveSslConfig(isRemoteDb),
  });

// Always store on globalThis so warm serverless instances and module reloads reuse connections
globalThis.pgPool = pool;
