import { z } from "zod";

export const experienceSchema = z.object({
  period: z
    .string()
    .trim()
    .min(1, "Periode pengalaman wajib diisi.")
    .max(100, "Periode maksimal 100 karakter."),
  role: z
    .string()
    .trim()
    .min(1, "Posisi / role wajib diisi.")
    .max(150, "Posisi maksimal 150 karakter."),
  organization: z
    .string()
    .trim()
    .min(1, "Institusi / organisasi wajib diisi.")
    .max(200, "Organisasi maksimal 200 karakter."),
  location: z
    .string()
    .trim()
    .max(100, "Lokasi maksimal 100 karakter.")
    .default("Malang, Indonesia"),
  type: z
    .string()
    .trim()
    .max(50, "Tipe pengalaman maksimal 50 karakter.")
    .default("Work"),
  description: z
    .string()
    .trim()
    .min(5, "Deskripsi minimal 5 karakter.")
    .max(2000, "Deskripsi maksimal 2000 karakter."),
  highlights: z
    .array(z.string().trim().min(1, "Highlight tidak boleh berupa string kosong."))
    .default([]),
  order_index: z
    .number()
    .int("Order index harus berupa bilangan bulat.")
    .default(0),
});

export const updateExperienceSchema = experienceSchema.partial();

export type ExperienceInput = z.infer<typeof experienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
