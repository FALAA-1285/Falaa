import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SECRET_KEY = process.env.ADMIN_JWT_SECRET || "falah_cms_super_secure_jwt_secret_key_2026_antigravity_safe";
const JWT_SECRET = new TextEncoder().encode(SECRET_KEY);

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

/**
 * Validate submitted credentials against env variables or default config
 */
export function validateAdminCredentials(email: string, pass: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL || "admin@falah.dev";
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123";

  return email.trim().toLowerCase() === expectedEmail.toLowerCase() && pass === expectedPassword;
}
