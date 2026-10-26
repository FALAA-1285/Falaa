import { pool } from "./pool";
import { ExperienceItem } from "@/types/portfolio";

export async function getExperiences(): Promise<ExperienceItem[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, period, role, organization, location, type, description, highlights, order_index, created_at
       FROM experiences
       ORDER BY order_index ASC, id ASC`
    );
    return rows.map((r) => ({
      id: r.id,
      period: r.period,
      role: r.role,
      organization: r.organization,
      location: r.location,
      type: r.type,
      description: r.description,
      highlights: Array.isArray(r.highlights) ? r.highlights : JSON.parse(r.highlights || "[]"),
      order_index: r.order_index,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error("Error fetching experiences from PostgreSQL:", error);
    return [];
  }
}

export async function getExperienceById(id: number): Promise<ExperienceItem | null> {
  try {
    const { rows } = await pool.query(
      `SELECT id, period, role, organization, location, type, description, highlights, order_index, created_at
       FROM experiences
       WHERE id = $1`,
      [id]
    );
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id,
      period: r.period,
      role: r.role,
      organization: r.organization,
      location: r.location,
      type: r.type,
      description: r.description,
      highlights: Array.isArray(r.highlights) ? r.highlights : JSON.parse(r.highlights || "[]"),
      order_index: r.order_index,
      created_at: r.created_at,
    };
  } catch (error) {
    console.error(`Error fetching experience '${id}' from PostgreSQL:`, error);
    return null;
  }
}

export async function createExperience(exp: Omit<ExperienceItem, "id">): Promise<ExperienceItem> {
  const { rows } = await pool.query(
    `INSERT INTO experiences (period, role, organization, location, type, description, highlights, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM experiences))
     RETURNING id, period, role, organization, location, type, description, highlights, order_index, created_at`,
    [
      exp.period,
      exp.role,
      exp.organization,
      exp.location,
      exp.type,
      exp.description,
      JSON.stringify(exp.highlights || []),
    ]
  );
  const r = rows[0];
  return {
    id: r.id,
    period: r.period,
    role: r.role,
    organization: r.organization,
    location: r.location,
    type: r.type,
    description: r.description,
    highlights: Array.isArray(r.highlights) ? r.highlights : JSON.parse(r.highlights || "[]"),
    order_index: r.order_index,
    created_at: r.created_at,
  };
}

export async function updateExperience(
  id: number,
  exp: Partial<ExperienceItem>
): Promise<ExperienceItem> {
  const current = await getExperienceById(id);
  if (!current) {
    throw new Error(`Pengalaman dengan ID '${id}' tidak ditemukan.`);
  }

  const period = exp.period ?? current.period;
  const role = exp.role ?? current.role;
  const organization = exp.organization ?? current.organization;
  const location = exp.location ?? current.location;
  const type = exp.type ?? current.type;
  const description = exp.description ?? current.description;
  const highlights = exp.highlights ? JSON.stringify(exp.highlights) : JSON.stringify(current.highlights);

  const { rows } = await pool.query(
    `UPDATE experiences
     SET period = $1, role = $2, organization = $3, location = $4,
         type = $5, description = $6, highlights = $7, updated_at = CURRENT_TIMESTAMP
     WHERE id = $8
     RETURNING id, period, role, organization, location, type, description, highlights, order_index, created_at`,
    [period, role, organization, location, type, description, highlights, id]
  );
  const r = rows[0];
  return {
    id: r.id,
    period: r.period,
    role: r.role,
    organization: r.organization,
    location: r.location,
    type: r.type,
    description: r.description,
    highlights: Array.isArray(r.highlights) ? r.highlights : JSON.parse(r.highlights || "[]"),
    order_index: r.order_index,
    created_at: r.created_at,
  };
}

export async function deleteExperience(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM experiences WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
