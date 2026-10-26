"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import {
  getSkills,
  getSkillsGrouped,
  createSkill,
  updateSkill,
  deleteSkill,
} from "@/lib/db";
import { SkillItem, SkillCategoryGroup } from "@/types/skills";

export async function getSkillsAction(): Promise<SkillItem[]> {
  return await getSkills();
}

export async function getSkillsGroupedAction(): Promise<SkillCategoryGroup[]> {
  return await getSkillsGrouped();
}

export async function createSkillAction(data: {
  name: string;
  category: string;
  icon: string;
}): Promise<{ success: boolean; skill?: SkillItem; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  if (!data.name || !data.category) {
    return { success: false, error: "Nama skill dan kategori wajib diisi." };
  }

  try {
    const created = await createSkill(data);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/skills");
    return { success: true, skill: created };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal membuat skill." };
  }
}

export async function updateSkillAction(
  id: number,
  data: { name?: string; category?: string; icon?: string }
): Promise<{ success: boolean; skill?: SkillItem; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  try {
    const updated = await updateSkill(id, data);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/skills");
    return { success: true, skill: updated };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal memperbarui skill." };
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
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal menghapus skill." };
  }
}
