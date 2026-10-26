"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createMessage } from "@/lib/db";
import { rateLimiter, getClientIp } from "@/lib/rate-limit";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .max(100, "Nama tidak boleh melebihi 100 karakter."),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format alamat email tidak valid.")
    .max(150, "Email tidak boleh melebihi 150 karakter."),
  subject: z
    .string()
    .trim()
    .max(200, "Subjek tidak boleh melebihi 200 karakter.")
    .optional(),
  message: z
    .string()
    .trim()
    .min(5, "Pesan minimal terdiri dari 5 karakter.")
    .max(3000, "Pesan tidak boleh melebihi 3000 karakter."),
  honeypot: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export async function sendContactMessageAction(
  rawInput: ContactFormData
): Promise<{ success: boolean; error?: string }> {
  const ip = await getClientIp();
  const rateLimitKey = `contact-form:${ip}`;

  // 1. Rate Limiting: Max 5 submissions per 10 minutes per IP
  const rateCheck = rateLimiter.check(rateLimitKey, {
    windowMs: 10 * 60 * 1000,
    maxRequests: 5,
  });

  if (!rateCheck.allowed) {
    const minutes = Math.max(1, Math.ceil(rateCheck.retryAfterSeconds / 60));
    return {
      success: false,
      error: `Terlalu banyak pengiriman pesan. Demi keamanan, silakan tunggu ${minutes} menit sebelum mengirim lagi.`,
    };
  }

  // 2. Strict Zod Schema Validation
  const parsed = contactFormSchema.safeParse(rawInput);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Data formulir tidak valid.";
    return { success: false, error: errorMsg };
  }

  const { name, email, subject, message, honeypot } = parsed.data;

  // 3. Honeypot Anti-Bot Trap:
  // If a bot filled out the hidden honeypot input, silently return success without database insertion
  if (honeypot && honeypot.trim().length > 0) {
    console.warn(`[BOT TRAP TRIGGERED] Spam bot trapped from IP ${ip}`);
    return { success: true };
  }

  // 4. Persistence into PostgreSQL
  try {
    await createMessage({
      name,
      email,
      subject: subject || "Pesan dari Portofolio",
      message,
    });

    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error creating contact message in database:", error);
    return {
      success: false,
      error: "Gagal mengirim pesan ke server. Silakan coba kembali nanti.",
    };
  }
}
