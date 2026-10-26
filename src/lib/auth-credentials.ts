import crypto from "crypto";

/**
 * Constant-time string equality check using SHA-256 digests and crypto.timingSafeEqual.
 * Prevents side-channel timing attacks that allow inferring secret values based on execution time.
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  const hashA = crypto.createHash("sha256").update(a).digest();
  const hashB = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Validate submitted credentials against env variables or default config using constant-time comparison.
 * Executed strictly in Node.js server action context.
 */
export function validateAdminCredentials(email: string, pass: string): boolean {
  const expectedEmail = (process.env.ADMIN_EMAIL || "admin@falah.dev").trim().toLowerCase();
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

  const inputEmail = email.trim().toLowerCase();

  const isEmailMatch = timingSafeStringEqual(inputEmail, expectedEmail);
  const isPassMatch = timingSafeStringEqual(pass, expectedPassword);

  return isEmailMatch && isPassMatch;
}
