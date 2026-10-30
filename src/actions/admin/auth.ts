"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, type LoginFormData } from "@/lib/schemas/auth";
import {
  signAdminToken,
  ADMIN_COOKIE_NAME,
  getAdminSession,
} from "@/lib/auth";
import { validateAdminCredentials } from "@/lib/auth-credentials";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action to authenticate admin and set HTTP-only cookie with brute-force rate limiting
 */
export async function loginAction(
  data: LoginFormData
): Promise<AuthActionResult> {
  const ip = await getClientIp();
  const rateLimitKey = `admin-login:${ip}`;

  // Rate limit: Max 5 login attempts per 15 minutes per IP
  const rateCheck = rateLimiter.check(rateLimitKey, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  });

  if (!rateCheck.allowed) {
    const minutesLeft = Math.max(1, Math.ceil(rateCheck.retryAfterSeconds / 60));
    return {
      success: false,
      error: `Terlalu banyak percobaan login. Akun dikunci sementara. Silakan coba kembali dalam ${minutesLeft} menit.`,
    };
  }

  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Input tidak valid";
    return { success: false, error: errorMsg };
  }

  const { email, password } = parsed.data;

  // Account-level brute-force defense: Max 10 attempts per 15 minutes across all IPs
  const emailRateLimitKey = `admin-login-target:${email.trim().toLowerCase()}`;
  const emailRateCheck = rateLimiter.check(emailRateLimitKey, {
    windowMs: 15 * 60 * 1000,
    maxRequests: 10,
  });

  if (!emailRateCheck.allowed) {
    const minutesLeft = Math.max(1, Math.ceil(emailRateCheck.retryAfterSeconds / 60));
    return {
      success: false,
      error: `Terlalu banyak percobaan login pada akun ini. Akun dikunci sementara. Silakan coba kembali dalam ${minutesLeft} menit.`,
    };
  }

  const isValid = validateAdminCredentials(email, password);
  if (!isValid) {
    return {
      success: false,
      error: `Email atau password admin tidak cocok. Sisa percobaan: ${rateCheck.remaining}`,
    };
  }

  // On successful login, clear the rate limit counter for this IP and account
  rateLimiter.reset(rateLimitKey);
  rateLimiter.reset(emailRateLimitKey);

  // Generate Admin JWT
  const token = await signAdminToken({
    email,
    role: "ADMIN",
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 jam
  });

  return { success: true };
}

/**
 * Server Action to logout admin
 */
export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}

/**
 * Server Action to verify active session
 */
export async function getCurrentAdmin() {
  return await getAdminSession();
}
