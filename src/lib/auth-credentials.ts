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
 * Validate submitted credentials against env variables with constant-time comparison.
 * In production, strictly requires ADMIN_EMAIL and ADMIN_PASSWORD (min 8 chars);
 * dangerous hardcoded fallback values are strictly rejected.
 * Executed strictly in Node.js server action context.
 */
export function validateAdminCredentials(email: string, pass: string): boolean {
  if (!email || !pass || typeof email !== "string" || typeof pass !== "string") {
    return false;
  }

  const isProd = process.env.NODE_ENV === "production";
  const rawExpectedEmail = process.env.ADMIN_EMAIL;
  const rawExpectedPassword = process.env.ADMIN_PASSWORD;

  // In production, reject login if required credentials are missing or too weak
  if (isProd && (!rawExpectedEmail || !rawExpectedPassword || rawExpectedPassword.length < 8)) {
    console.error(
      "[SECURITY FATAL] In production, ADMIN_EMAIL and ADMIN_PASSWORD (minimum 8 chars) must be configured in environment variables. Access denied."
    );
    return false;
  }

  // In non-production development, allow fallback with warning
  const expectedEmail = (rawExpectedEmail || "admin@falah.dev").trim().toLowerCase();
  const expectedPassword = rawExpectedPassword || "admin123";

  const inputEmail = email.trim().toLowerCase();

  const isEmailMatch = timingSafeStringEqual(inputEmail, expectedEmail);
  const isPassMatch = timingSafeStringEqual(pass, expectedPassword);

  return isEmailMatch && isPassMatch;
}
