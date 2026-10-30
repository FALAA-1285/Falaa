"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { invalidatePortfolioCache } from "@/lib/cached-data";
import { sanitizeActionError } from "@/lib/security";
import {
  getSkills,
  getSkillsGrouped,
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/lib/db";
import type { SkillItem, SkillCategoryGroup } from "@/types/skills";
import { skillSchema, updateSkillSchema, type SkillInput, type UpdateSkillInput } from "@/lib/schemas/skill";

export async function getSkillsAction(): Promise<SkillItem[]> {
  return await getSkills();
}

export async function getSkillsGroupedAction(): Promise<SkillCategoryGroup[]> {
  return await getSkillsGrouped();
}

export async function createSkillAction(
  data: SkillInput | { name: string; category: string; icon: string }
): Promise<{ success: boolean; skill?: SkillItem; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  const parsed = skillSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Data keahlian/skill tidak valid.";
    return { success: false, error: errorMsg };
  }

  try {
    const created = await createSkill(parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/skills");
    invalidatePortfolioCache();
    return { success: true, skill: created };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal membuat skill.") };
  }
}

export async function updateSkillAction(
  id: number,
  data: UpdateSkillInput | { name?: string; category?: string; icon?: string }
): Promise<{ success: boolean; skill?: SkillItem; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  const parsed = updateSkillSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Data perubahan keahlian/skill tidak valid.";
    return { success: false, error: errorMsg };
  }

  try {
    const updated = await updateSkill(id, parsed.data);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/skills");
    invalidatePortfolioCache();
    return { success: true, skill: updated };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal memperbarui skill.") };
  }
}

export async function deleteSkillAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  try {
    const deleted = await deleteSkill(id);
    if (!deleted) {
      return { success: false, error: `Skill '${id}' tidak ditemukan.` };
    }
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/skills");
    invalidatePortfolioCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal menghapus skill.") };
  }
}
