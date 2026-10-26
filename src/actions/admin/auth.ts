"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginSchema, LoginFormData } from "@/lib/schemas/auth";
import {
  signAdminToken,
  validateAdminCredentials,
  ADMIN_COOKIE_NAME,
  getAdminSession,
} from "@/lib/auth";

export interface AuthActionResult {
  success: boolean;
  error?: string;
}

/**
 * Server Action to authenticate admin and set HTTP-only cookie
 */
export async function loginAction(
  data: LoginFormData
): Promise<AuthActionResult> {
  const parsed = loginSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Input tidak valid";
    return { success: false, error: errorMsg };
  }

  const { email, password } = parsed.data;

  const isValid = validateAdminCredentials(email, password);
  if (!isValid) {
    return {
      success: false,
      error: "Email atau password admin tidak cocok",
    };
  }

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
