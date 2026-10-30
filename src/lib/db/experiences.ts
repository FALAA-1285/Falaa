import { pool } from "./pool";
import type { ExperienceItem } from "@/types/portfolio";
import { DEFAULT_EXPERIENCES } from "@/lib/constants";

export async function getExperiences(): Promise<ExperienceItem[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, period, role, organization, location, type, description, highlights, order_index, created_at
       FROM experiences
       ORDER BY order_index ASC, id ASC`
    );
    if (rows.length === 0) {
      return DEFAULT_EXPERIENCES;
    }
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
    return DEFAULT_EXPERIENCES;
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
  const isCompletePayload =
    exp.period !== undefined &&
    exp.role !== undefined &&
    exp.organization !== undefined &&
    exp.description !== undefined;

  let period = exp.period;
  let role = exp.role;
  let organization = exp.organization;
  let location = exp.location !== undefined ? exp.location : "Malang, Indonesia";
  let type = exp.type !== undefined ? exp.type : "Work";
  let description = exp.description;
  let highlights = exp.highlights ? JSON.stringify(exp.highlights) : undefined;
  let orderIndex = exp.order_index;

  if (!isCompletePayload) {
    const current = await getExperienceById(id);
    if (!current) {
      throw new Error(`Pengalaman dengan ID '${id}' tidak ditemukan.`);
    }
    if (period === undefined) period = current.period;
    if (role === undefined) role = current.role;
    if (organization === undefined) organization = current.organization;
    if (exp.location === undefined) location = current.location;
    if (exp.type === undefined) type = current.type;
    if (description === undefined) description = current.description;
    if (highlights === undefined) highlights = JSON.stringify(current.highlights);
    if (orderIndex === undefined) orderIndex = current.order_index ?? 0;
  }

  const { rows } = await pool.query(
    `UPDATE experiences
     SET period = $1, role = $2, organization = $3, location = $4,
         type = $5, description = $6, highlights = $7, order_index = COALESCE($8, order_index), updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING id, period, role, organization, location, type, description, highlights, order_index, created_at`,
    [period, role, organization, location, type, description, highlights ?? "[]", orderIndex ?? 0, id]
  );

  if (rows.length === 0) {
    throw new Error(`Pengalaman dengan ID '${id}' tidak ditemukan.`);
  }

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

/**
 * Persistently update the display order for experiences in a high-performance single batch query.
 * Guarantees zero duplicate order conflicts and eliminates N roundtrip network latency.
 */
export async function reorderExperiences(orderedIds: number[]): Promise<boolean> {
  if (!orderedIds || orderedIds.length === 0) return true;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderIndices = orderedIds.map((_, index) => index);
    await client.query(
      `UPDATE experiences AS e
       SET order_index = v.new_order,
           updated_at = CURRENT_TIMESTAMP
       FROM (
         SELECT unnest($1::int[]) AS id,
                unnest($2::int[]) AS new_order
       ) AS v
       WHERE e.id = v.id`,
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
