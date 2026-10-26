import { z } from "zod";

export const CATEGORIES = [
  "Web & Fullstack",
  "Mobile",
  "Machine Learning & Tools",
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
  image: z.string().min(1, "Gambar project wajib diunggah atau diisi URL-nya"),
  tags: z.array(z.string()).min(1, "Minimal 1 tag teknologi"),
  githubUrl: z
    .string()
    .url("URL GitHub tidak valid")
    .optional()
    .or(z.literal("")),
  liveUrl: z
    .string()
    .url("URL Demo Live tidak valid")
    .optional()
    .or(z.literal("")),
  features: z.array(z.string()).min(1, "Minimal 1 poin fitur utama"),
  metrics: z.string().optional().or(z.literal("")),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
