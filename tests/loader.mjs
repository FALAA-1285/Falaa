import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "next/headers") {
    const stubPath = path.resolve(process.cwd(), "tests", "stubs", "next-headers.mjs");
    return nextResolve(pathToFileURL(stubPath).href, context);
  }

  if (specifier === "next/cache") {
    const stubPath = path.resolve(process.cwd(), "tests", "stubs", "next-cache.mjs");
    return nextResolve(pathToFileURL(stubPath).href, context);
  }

  if (specifier === "next/navigation") {
    const stubPath = path.resolve(process.cwd(), "tests", "stubs", "next-navigation.mjs");
    return nextResolve(pathToFileURL(stubPath).href, context);
  }

  let targetSpecifier = specifier;

  if (specifier.startsWith("@/")) {
    const relativePath = specifier.slice(2);
    const resolvedBase = path.resolve(process.cwd(), "src", relativePath);

    if (fs.existsSync(resolvedBase + ".ts")) {
      return nextResolve(pathToFileURL(resolvedBase + ".ts").href, context);
    }
    if (fs.existsSync(resolvedBase + ".tsx")) {
      return nextResolve(pathToFileURL(resolvedBase + ".tsx").href, context);
    }
    if (fs.existsSync(path.join(resolvedBase, "index.ts"))) {
      return nextResolve(pathToFileURL(path.join(resolvedBase, "index.ts")).href, context);
    }
    targetSpecifier = pathToFileURL(resolvedBase).href;
  }

  try {
    return await nextResolve(targetSpecifier, context);
  } catch (err) {
    if (err.code === "ERR_MODULE_NOT_FOUND") {
      // Try appending .ts or .tsx
      try {
        return await nextResolve(targetSpecifier + ".ts", context);
      } catch {}
      try {
        return await nextResolve(targetSpecifier + ".tsx", context);
      } catch {}
    }
    throw err;
  }
}
