"use server";

import { revalidatePath } from "next/cache";
import { projectSchema, type ProjectFormData } from "@/lib/schemas/project";
import { getAdminSession } from "@/lib/auth";
import { invalidatePortfolioCache } from "@/lib/cached-data";
import { sanitizeUrl, sanitizeImageUrl, sanitizeActionError } from "@/lib/security";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/lib/db";
import type { Project } from "@/types/portfolio";

export interface ProjectActionResult {
  success: boolean;
  project?: Project;
  error?: string;
}

/**
 * Sanitize validated form data into a full project record. Empty optional fields become ""
 * (not undefined) so an update clears them instead of keeping the previous value.
 */
function toSafeProject(data: ProjectFormData): Project {
  return {
    ...data,
    image: sanitizeImageUrl(data.image),
    githubUrl: sanitizeUrl(data.githubUrl ?? ""),
    liveUrl: sanitizeUrl(data.liveUrl ?? ""),
    metrics: data.metrics ?? "",
  };
}

/**
 * Server Action: Create Project
 */
export async function createProjectAction(
  data: ProjectFormData
): Promise<ProjectActionResult> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Validasi data gagal.";
    return { success: false, error: errorMsg };
  }

  const safeData = toSafeProject(parsed.data);

  try {
    const newProject = await createProject(safeData);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    invalidatePortfolioCache();
    return { success: true, project: newProject };
  } catch (error: unknown) {
    return {
      success: false,
      error: sanitizeActionError(error, "Gagal membuat project baru."),
    };
  }
}

/**
 * Server Action: Update Project
 */
export async function updateProjectAction(
  id: string,
  data: ProjectFormData
): Promise<ProjectActionResult> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  const parsed = projectSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Validasi data gagal.";
    return { success: false, error: errorMsg };
  }

  const safeData = toSafeProject(parsed.data);

  try {
    const updated = await updateProject(id, safeData);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}/edit`);
    invalidatePortfolioCache();
    return { success: true, project: updated };
  } catch (error: unknown) {
    return {
      success: false,
      error: sanitizeActionError(error, "Gagal memperbarui project."),
    };
  }
}

/**
 * Server Action: Delete Project
 */
export async function deleteProjectAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  try {
    const deleted = await deleteProject(id);
    if (!deleted) {
      return { success: false, error: `Project '${id}' tidak ditemukan.` };
    }
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    invalidatePortfolioCache();
    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: sanitizeActionError(error, "Gagal menghapus project."),
    };
  }
}
