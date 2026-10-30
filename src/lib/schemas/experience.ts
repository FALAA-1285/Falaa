import { z } from "zod";

const experienceFields = {
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
    .max(100, "Lokasi maksimal 100 karakter."),
  type: z
    .string()
    .trim()
    .max(50, "Tipe pengalaman maksimal 50 karakter."),
  description: z
    .string()
    .trim()
    .min(5, "Deskripsi minimal 5 karakter.")
    .max(2000, "Deskripsi maksimal 2000 karakter."),
  highlights: z
    .array(z.string().trim().min(1, "Highlight tidak boleh berupa string kosong."))
    .max(20, "Maksimal 20 highlight."),
  order_index: z
    .number()
    .int("Order index harus berupa bilangan bulat.")
    .min(0, "Order index tidak boleh negatif."),
};

export const experienceSchema = z.object({
  ...experienceFields,
  location: experienceFields.location.default("Malang, Indonesia"),
  type: experienceFields.type.default("Work"),
  highlights: experienceFields.highlights.default([]),
  order_index: experienceFields.order_index.default(0),
});

// Built from the raw fields, not experienceSchema.partial(): Zod 4 still applies .default()
// inside optional fields, which would overwrite stored values (e.g. reset order_index to 0).
export const updateExperienceSchema = z.object(experienceFields).partial();

export type ExperienceInput = z.infer<typeof experienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;
