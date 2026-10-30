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
    .regex(
      /^[a-z0-9-]+$/,
      "ID hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)"
    ),
  title: z.string().min(3, "Judul project minimal 3 karakter"),
  category: z.enum(CATEGORIES, {
    message: "Kategori harus dipilih salah satu dari opsi yang tersedia",
  }),
  tagline: z.string().min(5, "Tagline minimal 5 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  image: z
    .string()
    .min(1, "Gambar project wajib diunggah atau diisi URL-nya")
    .refine(
      (val) => isSafeImageUrl(val),
      "Format URL gambar tidak aman atau tidak valid. Gunakan path internal (/uploads/..., /projects/...) atau URL http/https yang valid."
    ),
  tags: z.array(z.string()).min(1, "Minimal 1 tag teknologi"),
  githubUrl: z
    .string()
    .trim()
    .refine(
      (val) => !val || isSafeUrl(val),
      "URL GitHub harus valid dan menggunakan protokol http:// atau https:// (skema berbahaya seperti javascript: dilarang)"
    )
    .optional()
    .or(z.literal("")),
  liveUrl: z
    .string()
    .trim()
    .refine(
      (val) => !val || isSafeUrl(val),
      "URL Demo Live harus valid dan menggunakan protokol http:// atau https:// (skema berbahaya seperti javascript: dilarang)"
    )
    .optional()
    .or(z.literal("")),
  features: z.array(z.string()).min(1, "Minimal 1 poin fitur utama"),
  metrics: z.string().optional().or(z.literal("")),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
