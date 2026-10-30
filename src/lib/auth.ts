import { cache } from "react";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export function resolveJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "[FATAL SECURITY ERROR] ADMIN_JWT_SECRET must be defined with at least 32 characters in production environment."
      );
    }
    console.warn(
      "[SECURITY ADVISORY] ADMIN_JWT_SECRET is not set or too short (< 32 chars). Using development fallback."
    );
    return new TextEncoder().encode(
      "falah_portfolio_default_jwt_secret_key_minimum_32_characters_long_2026"
    );
  }
  return new TextEncoder().encode(secret.trim());
}

export const ADMIN_COOKIE_NAME = "admin_token";

export interface AdminPayload {
  email: string;
  role: "ADMIN";
}

/**
 * Sign a new Admin JWT token using JOSE (HS256)
 */
export async function signAdminToken(payload: AdminPayload): Promise<string> {
  const secretKey = resolveJwtSecret();
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

/**
 * Verify and decode an Admin JWT token (works in Edge Runtime & Node.js)
 */
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const secretKey = resolveJwtSecret();
    const { payload } = await jwtVerify(token, secretKey);
    if (payload && payload.role === "ADMIN" && typeof payload.email === "string") {
      return {
        email: payload.email,
        role: "ADMIN",
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Get the current admin session from server cookies (Next.js App Router)
 */
export async function getAdminSession(): Promise<AdminPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifyAdminToken(token);
}

/**
 * Data Access Layer guard for admin Server Components. proxy.ts only performs an optimistic
 * redirect; this re-verifies the session next to the data and redirects to login otherwise.
 * Memoized per render pass with React cache().
 */
export const requireAdminSession = cache(async (): Promise<AdminPayload> => {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
});
