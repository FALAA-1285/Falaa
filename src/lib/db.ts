import fs from "fs/promises";
import path from "path";
import { Project } from "@/types/portfolio";

const DB_PATH = path.join(process.cwd(), "src", "data", "projects.json");

/**
 * Read all projects from the persistent JSON store
 */
export async function getProjects(): Promise<Project[]> {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data) as Project[];
  } catch (error) {
    console.error("Error reading projects db, returning empty array:", error);
    return [];
  }
}

/**
 * Find a project by its unique ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  const projects = await getProjects();
  const found = projects.find((p) => p.id === id);
  return found || null;
}

/**
 * Create and persist a new project
 */
export async function createProject(newProject: Project): Promise<Project> {
  const projects = await getProjects();
  const exists = projects.some((p) => p.id === newProject.id);
  if (exists) {
    throw new Error(`Project dengan ID '${newProject.id}' sudah ada.`);
  }

  const updatedProjects = [newProject, ...projects];
  await fs.writeFile(DB_PATH, JSON.stringify(updatedProjects, null, 2), "utf-8");
  return newProject;
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  updatedData: Partial<Project>
): Promise<Project> {
  const projects = await getProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new Error(`Project dengan ID '${id}' tidak ditemukan.`);
  }

  const updatedProject = { ...projects[index], ...updatedData };
  projects[index] = updatedProject;

  await fs.writeFile(DB_PATH, JSON.stringify(projects, null, 2), "utf-8");
  return updatedProject;
}

/**
 * Delete a project by its ID
 */
export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) {
    return false;
  }

  await fs.writeFile(DB_PATH, JSON.stringify(filtered, null, 2), "utf-8");
  return true;
}
