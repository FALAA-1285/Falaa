import { pool } from "./pool";
import { Project } from "@/types/portfolio";

export async function getProjects(): Promise<Project[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, category, tagline, description, image, tags,
              github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
              created_at, updated_at
       FROM projects
       ORDER BY order_index ASC, created_at DESC`
    );
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      tagline: r.tagline,
      description: r.description,
      image: r.image,
      tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
      githubUrl: r.githubUrl || undefined,
      liveUrl: r.liveUrl || undefined,
      features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || "[]"),
      metrics: r.metrics || undefined,
      order_index: r.order_index,
      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  } catch (error) {
    console.error("Error reading projects from PostgreSQL:", error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, category, tagline, description, image, tags,
              github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
              created_at, updated_at
       FROM projects
       WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      title: r.title,
      category: r.category,
      tagline: r.tagline,
      description: r.description,
      image: r.image,
      tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
      githubUrl: r.githubUrl || undefined,
      liveUrl: r.liveUrl || undefined,
      features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || "[]"),
      metrics: r.metrics || undefined,
      order_index: r.order_index,
      created_at: r.created_at,
      updated_at: r.updated_at,
    };
  } catch (error) {
    console.error(`Error reading project '${id}' from PostgreSQL:`, error);
    return null;
  }
}

export async function createProject(p: Project): Promise<Project> {
  const { rows } = await pool.query(
    `INSERT INTO projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM projects))
     RETURNING id, title, category, tagline, description, image, tags,
               github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
               created_at, updated_at`,
    [
      p.id,
      p.title,
      p.category,
      p.tagline,
      p.description,
      p.image,
      JSON.stringify(p.tags || []),
      p.githubUrl || "",
      p.liveUrl || "",
      JSON.stringify(p.features || []),
      p.metrics || "",
    ]
  );
  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    tagline: r.tagline,
    description: r.description,
    image: r.image,
    tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
    githubUrl: r.githubUrl || undefined,
    liveUrl: r.liveUrl || undefined,
    features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || "[]"),
    metrics: r.metrics || undefined,
    order_index: r.order_index,
  };
}

export async function updateProject(
  id: string,
  p: Partial<Project>
): Promise<Project> {
  const current = await getProjectById(id);
  if (!current) {
    throw new Error(`Project dengan ID '${id}' tidak ditemukan.`);
  }

  const updatedTitle = p.title !== undefined ? p.title : current.title;
  const updatedCategory = p.category !== undefined ? p.category : current.category;
  const updatedTagline = p.tagline !== undefined ? p.tagline : current.tagline;
  const updatedDescription = p.description !== undefined ? p.description : current.description;
  const updatedImage = p.image !== undefined ? p.image : current.image;
  const updatedTags = p.tags !== undefined ? JSON.stringify(p.tags) : JSON.stringify(current.tags);
  const updatedGithub = p.githubUrl !== undefined ? p.githubUrl : (current.githubUrl || "");
  const updatedLive = p.liveUrl !== undefined ? p.liveUrl : (current.liveUrl || "");
  const updatedFeatures = p.features !== undefined ? JSON.stringify(p.features) : JSON.stringify(current.features);
  const updatedMetrics = p.metrics !== undefined ? p.metrics : (current.metrics || "");

  const { rows } = await pool.query(
    `UPDATE projects
     SET title = $1, category = $2, tagline = $3, description = $4,
         image = $5, tags = $6, github_url = $7, live_url = $8,
         features = $9, metrics = $10, updated_at = CURRENT_TIMESTAMP
     WHERE id = $11
     RETURNING id, title, category, tagline, description, image, tags,
               github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
               created_at, updated_at`,
    [
      updatedTitle,
      updatedCategory,
      updatedTagline,
      updatedDescription,
      updatedImage,
      updatedTags,
      updatedGithub,
      updatedLive,
      updatedFeatures,
      updatedMetrics,
      id,
    ]
  );

  const r = rows[0];
  return {
    id: r.id,
    title: r.title,
    category: r.category,
    tagline: r.tagline,
    description: r.description,
    image: r.image,
    tags: Array.isArray(r.tags) ? r.tags : JSON.parse(r.tags || "[]"),
    githubUrl: r.githubUrl || undefined,
    liveUrl: r.liveUrl || undefined,
    features: Array.isArray(r.features) ? r.features : JSON.parse(r.features || "[]"),
    metrics: r.metrics || undefined,
    order_index: r.order_index,
  };
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM projects WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
