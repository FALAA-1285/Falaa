import { register } from "node:module";
import fs from "node:fs";

if (fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
} else if (fs.existsSync(".env")) {
  process.loadEnvFile(".env");
}

register("./loader.mjs", import.meta.url);
