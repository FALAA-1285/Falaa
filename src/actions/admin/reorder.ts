"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { invalidatePortfolioCache } from "@/lib/cached-data";
import { sanitizeActionError } from "@/lib/security";
import {
  reorderProjects,
  reorderExperiences,
  reorderSkills,
} from "@/lib/db";

export interface ReorderResult {
  success: boolean;
  error?: string;
}

/**
 * Persistently reorder projects in a transactional database update.
 * Changes immediately reflect on both the public portfolio and admin panel.
 */
export async function reorderProjectsAction(
  orderedIds: string[]
): Promise<ReorderResult> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { success: false, error: "Daftar ID proyek untuk pengurutan tidak valid." };
  }

  // Prevent order conflict by checking for duplicate IDs
  const uniqueCount = new Set(orderedIds).size;
  if (uniqueCount !== orderedIds.length) {
    return { success: false, error: "Terdapat duplikasi ID proyek dalam urutan." };
  }

  try {
    await reorderProjects(orderedIds);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    invalidatePortfolioCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal memperbarui urutan proyek.") };
  }
}

/**
 * Persistently reorder experiences in a transactional database update.
 */
export async function reorderExperiencesAction(
  orderedIds: number[]
): Promise<ReorderResult> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { success: false, error: "Daftar ID pengalaman untuk pengurutan tidak valid." };
  }

  const uniqueCount = new Set(orderedIds).size;
  if (uniqueCount !== orderedIds.length) {
    return { success: false, error: "Terdapat duplikasi ID pengalaman dalam urutan." };
  }

  try {
    await reorderExperiences(orderedIds);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/experiences");
    invalidatePortfolioCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal memperbarui urutan pengalaman.") };
  }
}

/**
 * Persistently reorder skills in a transactional database update.
 */
export async function reorderSkillsAction(
  orderedIds: number[]
): Promise<ReorderResult> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { success: false, error: "Daftar ID skill untuk pengurutan tidak valid." };
  }

  const uniqueCount = new Set(orderedIds).size;
  if (uniqueCount !== orderedIds.length) {
    return { success: false, error: "Terdapat duplikasi ID skill dalam urutan." };
  }

  try {
    await reorderSkills(orderedIds);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/skills");
    invalidatePortfolioCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal memperbarui urutan skill.") };
  }
}
