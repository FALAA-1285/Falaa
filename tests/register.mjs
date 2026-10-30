import { register } from "node:module";
import fs from "node:fs";

if (fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
} else if (fs.existsSync(".env")) {
  process.loadEnvFile(".env");
}

// Never let the test suite touch the application database (DATABASE_URL may point at production).
// Integration tests run only against an explicit, disposable TEST_DATABASE_URL; otherwise point
// at an unreachable port so any accidental query fails fast instead of writing real data.
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL || "postgresql://postgres@127.0.0.1:1/unreachable";
process.env.PG_MAX_POOL_SIZE = "2";

register("./loader.mjs", import.meta.url);
