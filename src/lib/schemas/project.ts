import { z } from "zod";

import { isSafeUrl, isSafeImageUrl } from "@/lib/security";

export const CATEGORIES = [
  "Web & Fullstack",
  "Mobile",
  "Machine Learning & Tools",
  "UI/UX Desain",
] as const;

export const projectSchema = z.object({
  id: z
    .string()
    .min(2, "ID/Slug minimal 2 karakter")
    .max(100, "ID/Slug maksimal 100 karakter")
    .regex(
      /^[a-z0-9-]+$/,
      "ID hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"
    ),
  title: z
    .string()
    .min(3, "Judul project minimal 3 karakter")
    .max(255, "Judul project maksimal 255 karakter"),
  category: z.enum(CATEGORIES, {
    message: "Kategori harus dipilih salah satu dari opsi yang tersedia",
  }),
  tagline: z
    .string()
    .min(5, "Tagline minimal 5 karakter")
    .max(300, "Tagline maksimal 300 karakter"),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter")
    .max(5000, "Deskripsi maksimal 5000 karakter"),
  image: z
    .string()
    .min(1, "Gambar project wajib diunggah atau diisi URL-nya")
    .max(2048, "URL gambar terlalu panjang")
    .refine(
      (val) => isSafeImageUrl(val),
      "Format URL gambar tidak aman atau tidak valid. Gunakan path internal (/uploads/..., /projects/...) atau URL http/https yang valid."
    ),
  tags: z
    .array(z.string().max(50, "Tag maksimal 50 karakter"))
    .min(1, "Minimal 1 tag teknologi")
    .max(30, "Maksimal 30 tag teknologi"),
  githubUrl: z
    .string()
    .trim()
    .max(2048, "URL terlalu panjang")
    .refine(
      (val) => !val || isSafeUrl(val),
      "URL GitHub harus valid dan menggunakan protokol http:// atau https:// (skema berbahaya seperti javascript: dilarang)"
    )
    .optional()
    .or(z.literal("")),
  liveUrl: z
    .string()
    .trim()
    .max(2048, "URL terlalu panjang")
    .refine(
      (val) => !val || isSafeUrl(val),
      "URL Demo Live harus valid dan menggunakan protokol http:// atau https:// (skema berbahaya seperti javascript: dilarang)"
    )
    .optional()
    .or(z.literal("")),
  features: z
    .array(z.string().max(500, "Poin fitur maksimal 500 karakter"))
    .min(1, "Minimal 1 poin fitur utama")
    .max(20, "Maksimal 20 poin fitur"),
  metrics: z.string().max(300, "Metrics maksimal 300 karakter").optional().or(z.literal("")),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
