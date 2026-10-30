import { z } from "zod";

function isSafeIconName(icon: string): boolean {
  if (!icon || icon.includes("..") || icon.includes("/") || icon.includes("\\")) {
    return false;
  }
  // Either a safe image file with allowed extension, or a plain icon name without dots/special chars
  const hasAllowedImageExt = /^[a-zA-Z0-9_\-]+\.(svg|png|webp|ico|jpg)$/i.test(icon);
  const isPlainIdentifier = /^[a-zA-Z0-9_\-]+$/.test(icon);
  return hasAllowedImageExt || isPlainIdentifier;
}

const skillFields = {
  name: z
    .string()
    .trim()
    .min(1, "Nama skill wajib diisi.")
    .max(100, "Nama skill maksimal 100 karakter."),
  category: z
    .string()
    .trim()
    .min(1, "Kategori skill wajib diisi.")
    .max(100, "Kategori maksimal 100 karakter."),
  icon: z
    .string()
    .trim()
    .min(1, "Icon skill wajib diisi.")
    .max(100, "Nama file icon maksimal 100 karakter.")
    .refine(isSafeIconName, {
      message: "Nama berkas icon tidak valid atau mengandung karakter tidak aman.",
    }),
  order_index: z
    .number()
    .int("Order index harus berupa bilangan bulat.")
    .min(0, "Order index tidak boleh negatif."),
};

export const skillSchema = z.object({
  ...skillFields,
  icon: skillFields.icon.default("nextjs.svg"),
  order_index: skillFields.order_index.default(0),
});

// Built from the raw fields, not skillSchema.partial(): Zod 4 still applies .default()
// inside optional fields, which would overwrite stored values (e.g. reset order_index to 0).
export const updateSkillSchema = z.object(skillFields).partial();

export type SkillInput = z.infer<typeof skillSchema>;
export type UpdateSkillInput = z.infer<typeof updateSkillSchema>;
