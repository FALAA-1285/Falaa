import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

function resolveJwtSecret(): Uint8Array {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret || secret.trim().length === 0) {
    console.warn(
      "[SECURITY ADVISORY] ADMIN_JWT_SECRET is not set in environment. Using fallback key. It is strongly recommended to set ADMIN_JWT_SECRET in your Vercel Environment Variables."
    );
    return new TextEncoder().encode(
      "falah_portfolio_default_jwt_secret_key_minimum_32_characters_long_2026"
    );
  }
  return new TextEncoder().encode(secret);
}

const JWT_SECRET = resolveJwtSecret();

export const ADMIN_COOKIE_NAME = "admin_token";

export interface AdminPayload {
  email: string;
  role: "ADMIN";
}

/**
 * Sign a new Admin JWT token using JOSE (HS256)
 */
export async function signAdminToken(payload: AdminPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

/**
 * Verify and decode an Admin JWT token (works in Edge Runtime & Node.js)
 */
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload && payload.role === "ADMIN") {
      return {
        email: payload.email as string,
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
