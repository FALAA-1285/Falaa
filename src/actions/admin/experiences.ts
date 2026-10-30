"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { invalidatePortfolioCache } from "@/lib/cached-data";
import { sanitizeActionError } from "@/lib/security";
import {
  createExperience,
  updateExperience,
  deleteExperience,
} from "@/lib/db";
import type { ExperienceItem } from "@/types/portfolio";
import { experienceSchema, updateExperienceSchema, type ExperienceInput, type UpdateExperienceInput } from "@/lib/schemas/experience";

export async function createExperienceAction(
  data: ExperienceInput | Omit<ExperienceItem, "id">
): Promise<{ success: boolean; experience?: ExperienceItem; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  const parsed = experienceSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Data formulir pengalaman tidak valid.";
    return { success: false, error: errorMsg };
  }

  try {
    const created = await createExperience(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/experiences");
    invalidatePortfolioCache();
    return { success: true, experience: created };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal membuat pengalaman.") };
  }
}

export async function updateExperienceAction(
  id: number,
  data: UpdateExperienceInput | Partial<ExperienceItem>
): Promise<{ success: boolean; experience?: ExperienceItem; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  const parsed = updateExperienceSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Data perubahan pengalaman tidak valid.";
    return { success: false, error: errorMsg };
  }

  try {
    const updated = await updateExperience(id, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/experiences");
    invalidatePortfolioCache();
    return { success: true, experience: updated };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal memperbarui pengalaman.") };
  }
}

export async function deleteExperienceAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  try {
    const deleted = await deleteExperience(id);
    if (!deleted) {
      return { success: false, error: `Pengalaman '${id}' tidak ditemukan.` };
    }
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/experiences");
    invalidatePortfolioCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal menghapus pengalaman.") };
  }
}
