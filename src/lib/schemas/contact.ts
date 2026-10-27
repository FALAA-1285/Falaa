import { z } from "zod";
import { isSafeEmail } from "@/lib/security";

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
    .max(150, "Email tidak boleh melebihi 150 karakter.")
    .refine((val) => isSafeEmail(val), {
      message: "Format alamat email mengandung karakter yang tidak aman.",
    }),
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
