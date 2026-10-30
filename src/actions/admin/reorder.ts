"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
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

const MAX_REORDER_ITEMS = 500;
const projectIdsSchema = z.array(z.string().min(1).max(100)).min(1).max(MAX_REORDER_ITEMS);
const serialIdsSchema = z.array(z.number().int().positive()).min(1).max(MAX_REORDER_ITEMS);

/**
 * Validate an ordered ID list: correct element type, bounded length, and no duplicates
 * (duplicates would produce conflicting order_index values).
 */
function validateOrderedIds(
  orderedIds: unknown,
  schema: z.ZodType<unknown[]>,
  label: string
): string | null {
  if (!schema.safeParse(orderedIds).success) {
    return `Daftar ID ${label} untuk pengurutan tidak valid.`;
  }
  const ids = orderedIds as unknown[];
  if (new Set(ids).size !== ids.length) {
    return `Terdapat duplikasi ID ${label} dalam urutan.`;
  }
  return null;
}

async function runReorder(
  orderedIds: unknown,
  schema: z.ZodType<unknown[]>,
  label: string,
  adminPath: string,
  persist: () => Promise<unknown>
): Promise<ReorderResult> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  const validationError = validateOrderedIds(orderedIds, schema, label);
  if (validationError) {
    return { success: false, error: validationError };
  }

  try {
    await persist();
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath(adminPath);
    invalidatePortfolioCache();
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, `Gagal memperbarui urutan ${label}.`) };
  }
}

/**
 * Persistently reorder projects in a transactional database update.
 * Changes immediately reflect on both the public portfolio and admin panel.
 */
export async function reorderProjectsAction(
  orderedIds: string[]
): Promise<ReorderResult> {
  return runReorder(orderedIds, projectIdsSchema, "proyek", "/admin/projects", () =>
    reorderProjects(orderedIds)
  );
}

/**
 * Persistently reorder experiences in a transactional database update.
 */
export async function reorderExperiencesAction(
  orderedIds: number[]
): Promise<ReorderResult> {
  return runReorder(orderedIds, serialIdsSchema, "pengalaman", "/admin/experiences", () =>
    reorderExperiences(orderedIds)
  );
}

/**
 * Persistently reorder skills in a transactional database update.
 */
export async function reorderSkillsAction(
  orderedIds: number[]
): Promise<ReorderResult> {
  return runReorder(orderedIds, serialIdsSchema, "skill", "/admin/skills", () =>
    reorderSkills(orderedIds)
  );
}
