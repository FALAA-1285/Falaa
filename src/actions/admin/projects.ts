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
  getProjects,
  getProjectById,
} from "@/lib/db";
import type { Project } from "@/types/portfolio";

export interface ProjectActionResult {
  success: boolean;
  project?: Project;
  error?: string;
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

  const safeData: Project = {
    ...parsed.data,
    image: sanitizeImageUrl(parsed.data.image),
    githubUrl: parsed.data.githubUrl ? sanitizeUrl(parsed.data.githubUrl) : undefined,
    liveUrl: parsed.data.liveUrl ? sanitizeUrl(parsed.data.liveUrl) : undefined,
  };

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

  const safeData: Project = {
    ...parsed.data,
    image: sanitizeImageUrl(parsed.data.image),
    githubUrl: parsed.data.githubUrl ? sanitizeUrl(parsed.data.githubUrl) : undefined,
    liveUrl: parsed.data.liveUrl ? sanitizeUrl(parsed.data.liveUrl) : undefined,
  };

  try {
    const updated = await updateProject(id, safeData);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    invalidatePortfolioCache();
    revalidatePath(`/admin/projects/${id}/edit`);
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

/**
 * Server Action: Read all projects (Server Action helper)
 */
export async function getProjectsAction(): Promise<Project[]> {
  return await getProjects();
}

/**
 * Server Action: Read project by ID
 */
export async function getProjectByIdAction(id: string): Promise<Project | null> {
  return await getProjectById(id);
}
