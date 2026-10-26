"use server";

import { revalidatePath } from "next/cache";
import { projectSchema, ProjectFormData } from "@/lib/schemas/project";
import { getAdminSession } from "@/lib/auth";
import {
  createProject,
  updateProject,
  deleteProject,
  getProjects,
  getProjectById,
} from "@/lib/db";
import { Project } from "@/types/portfolio";

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

  try {
    const newProject = await createProject(parsed.data as Project);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    return { success: true, project: newProject };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Gagal membuat project baru.",
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

  try {
    const updated = await updateProject(id, parsed.data as Project);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/projects");
    revalidatePath(`/admin/projects/${id}/edit`);
    return { success: true, project: updated };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Gagal memperbarui project.",
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
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error?.message || "Gagal menghapus project.",
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
