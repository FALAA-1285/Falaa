import { z } from "zod";
import { isSafeUrl, isSafeEmail } from "@/lib/security";

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nama minimal 2 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  handle: z
    .string()
    .trim()
    .min(2, "Handle minimal 2 karakter")
    .max(50, "Handle maksimal 50 karakter"),
  title: z
    .string()
    .trim()
    .min(2, "Title / Profesi minimal 2 karakter")
    .max(120, "Title / Profesi maksimal 120 karakter"),
  institution: z
    .string()
    .trim()
    .max(150, "Institusi maksimal 150 karakter")
    .default(""),
  location: z
    .string()
    .trim()
    .max(150, "Lokasi maksimal 150 karakter")
    .default(""),
  email: z
    .string()
    .trim()
    .min(1, "Email kontak wajib diisi")
    .email("Format email kontak tidak valid")
    .refine((val) => isSafeEmail(val), "Alamat email mengandung karakter tidak aman"),
  linkedin: z
    .string()
    .trim()
    .refine(
      (val) => !val || isSafeUrl(val),
      "URL LinkedIn harus valid dan menggunakan protokol http:// atau https:// (skema berbahaya seperti javascript: dilarang)"
    )
    .default(""),
  github: z
    .string()
    .trim()
    .refine(
      (val) => !val || isSafeUrl(val),
      "URL GitHub harus valid dan menggunakan protokol http:// atau https:// (skema berbahaya seperti javascript: dilarang)"
    )
    .default(""),
  quote: z
    .string()
    .trim()
    .max(500, "Quote maksimal 500 karakter")
    .default(""),
  about: z
    .string()
    .trim()
    .min(5, "Deskripsi 'About' minimal 5 karakter")
    .max(3000, "Deskripsi 'About' maksimal 3000 karakter"),
  aboutSub: z
    .string()
    .trim()
    .max(3000, "Deskripsi keahlian khusus maksimal 3000 karakter")
    .default(""),
  aboutHeadline: z
    .string()
    .trim()
    .max(300, "Headline About maksimal 300 karakter")
    .optional(),
  aboutTags: z.array(z.string().trim()).optional().default([]),
  ctaHeadline: z
    .string()
    .trim()
    .max(300, "Headline CTA maksimal 300 karakter")
    .optional(),
  ctaSub: z
    .string()
    .trim()
    .max(2000, "Deskripsi CTA maksimal 2000 karakter")
    .optional(),
  ctaButtonText: z
    .string()
    .trim()
    .max(100, "Teks tombol CTA maksimal 100 karakter")
    .optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
