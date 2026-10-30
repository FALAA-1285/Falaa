import { pool } from "./pool";
import { parseJsonArray } from "./json";
import type { Project } from "@/types/portfolio";
import { DEFAULT_PROJECTS } from "@/lib/constants";

const PROJECT_COLUMNS = `id, title, category, tagline, description, image, tags,
       github_url as "githubUrl", live_url as "liveUrl", features, metrics, order_index,
       created_at, updated_at`;

function mapProjectRow(r: Record<string, unknown>): Project {
  return {
    id: r.id as string,
    title: r.title as string,
    category: r.category as string,
    tagline: r.tagline as string,
    description: r.description as string,
    image: r.image as string,
    tags: parseJsonArray(r.tags),
    githubUrl: (r.githubUrl as string) || undefined,
    liveUrl: (r.liveUrl as string) || undefined,
    features: parseJsonArray(r.features),
    metrics: (r.metrics as string) || undefined,
    order_index: r.order_index as number,
    created_at: r.created_at as string | undefined,
    updated_at: r.updated_at as string | undefined,
  };
}

export async function getProjects(): Promise<Project[]> {
  try {
    const { rows } = await pool.query(
      `SELECT ${PROJECT_COLUMNS}
       FROM projects
       ORDER BY order_index ASC, created_at DESC`
    );
    if (rows.length === 0) {
      return DEFAULT_PROJECTS;
    }
    return rows.map(mapProjectRow);
  } catch (error) {
    console.error("Error reading projects from PostgreSQL:", error);
    return DEFAULT_PROJECTS;
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { rows } = await pool.query(
      `SELECT ${PROJECT_COLUMNS}
       FROM projects
       WHERE id = $1`,
      [id]
    );
    return rows.length === 0 ? null : mapProjectRow(rows[0]);
  } catch (error) {
    console.error(`Error reading project '${id}' from PostgreSQL:`, error);
    return null;
  }
}

export async function createProject(p: Project): Promise<Project> {
  const { rows } = await pool.query(
    `INSERT INTO projects (id, title, category, tagline, description, image, tags, github_url, live_url, features, metrics, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM projects))
     RETURNING ${PROJECT_COLUMNS}`,
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
  return mapProjectRow(rows[0]);
}

/**
 * Update a project. Fields left `undefined` keep their stored value (single atomic statement,
 * no read-before-write). Pass an empty string to clear githubUrl / liveUrl / metrics.
 */
export async function updateProject(
  id: string,
  p: Partial<Project>
): Promise<Project> {
  const { rows } = await pool.query(
    `UPDATE projects
     SET title = COALESCE($1, title),
         category = COALESCE($2, category),
         tagline = COALESCE($3, tagline),
         description = COALESCE($4, description),
         image = COALESCE($5, image),
         tags = COALESCE($6::jsonb, tags),
         github_url = COALESCE($7, github_url),
         live_url = COALESCE($8, live_url),
         features = COALESCE($9::jsonb, features),
         metrics = COALESCE($10, metrics),
         order_index = COALESCE($11, order_index),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $12
     RETURNING ${PROJECT_COLUMNS}`,
    [
      p.title ?? null,
      p.category ?? null,
      p.tagline ?? null,
      p.description ?? null,
      p.image ?? null,
      p.tags !== undefined ? JSON.stringify(p.tags) : null,
      p.githubUrl ?? null,
      p.liveUrl ?? null,
      p.features !== undefined ? JSON.stringify(p.features) : null,
      p.metrics ?? null,
      p.order_index ?? null,
      id,
    ]
  );

  if (rows.length === 0) {
    throw new Error(`Project dengan ID '${id}' tidak ditemukan.`);
  }
  return mapProjectRow(rows[0]);
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = await pool.query("DELETE FROM projects WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Persistently update the display order for projects in a high-performance single batch query.
 * Guarantees zero duplicate order conflicts and eliminates N roundtrip network latency.
 */
export async function reorderProjects(orderedIds: string[]): Promise<boolean> {
  if (!orderedIds || orderedIds.length === 0) return true;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderIndices = orderedIds.map((_, index) => index);
    await client.query(
      `UPDATE projects AS p
       SET order_index = v.new_order,
           updated_at = CURRENT_TIMESTAMP
       FROM (
         SELECT unnest($1::text[]) AS id,
                unnest($2::int[]) AS new_order
       ) AS v
       WHERE p.id = v.id`,
      [orderedIds, orderIndices]
    );
    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
