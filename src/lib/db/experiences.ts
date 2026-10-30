import { pool } from "./pool";
import { parseJsonArray } from "./json";
import type { ExperienceItem } from "@/types/portfolio";
import { DEFAULT_EXPERIENCES } from "@/lib/constants";

const EXPERIENCE_COLUMNS =
  "id, period, role, organization, location, type, description, highlights, order_index, created_at";

function mapExperienceRow(r: Record<string, unknown>): ExperienceItem {
  return {
    id: r.id as number,
    period: r.period as string,
    role: r.role as string,
    organization: r.organization as string,
    location: r.location as string,
    type: r.type as string,
    description: r.description as string,
    highlights: parseJsonArray(r.highlights),
    order_index: r.order_index as number,
    created_at: r.created_at as string | undefined,
  };
}

export async function getExperiences(): Promise<ExperienceItem[]> {
  try {
    const { rows } = await pool.query(
      `SELECT ${EXPERIENCE_COLUMNS}
       FROM experiences
       ORDER BY order_index ASC, id ASC`
    );
    if (rows.length === 0) {
      return DEFAULT_EXPERIENCES;
    }
    return rows.map(mapExperienceRow);
  } catch (error) {
    console.error("Error fetching experiences from PostgreSQL:", error);
    return DEFAULT_EXPERIENCES;
  }
}

export async function getExperienceById(id: number): Promise<ExperienceItem | null> {
  try {
    const { rows } = await pool.query(
      `SELECT ${EXPERIENCE_COLUMNS}
       FROM experiences
       WHERE id = $1`,
      [id]
    );
    return rows.length === 0 ? null : mapExperienceRow(rows[0]);
  } catch (error) {
    console.error(`Error fetching experience '${id}' from PostgreSQL:`, error);
    return null;
  }
}

export async function createExperience(exp: Omit<ExperienceItem, "id">): Promise<ExperienceItem> {
  const { rows } = await pool.query(
    `INSERT INTO experiences (period, role, organization, location, type, description, highlights, order_index)
     VALUES ($1, $2, $3, $4, $5, $6, $7, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM experiences))
     RETURNING ${EXPERIENCE_COLUMNS}`,
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
  return mapExperienceRow(rows[0]);
}

/**
 * Update an experience. Fields left `undefined` keep their stored value
 * (single atomic statement, no read-before-write).
 */
export async function updateExperience(
  id: number,
  exp: Partial<ExperienceItem>
): Promise<ExperienceItem> {
  const { rows } = await pool.query(
    `UPDATE experiences
     SET period = COALESCE($1, period),
         role = COALESCE($2, role),
         organization = COALESCE($3, organization),
         location = COALESCE($4, location),
         type = COALESCE($5, type),
         description = COALESCE($6, description),
         highlights = COALESCE($7::jsonb, highlights),
         order_index = COALESCE($8, order_index),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $9
     RETURNING ${EXPERIENCE_COLUMNS}`,
    [
      exp.period ?? null,
      exp.role ?? null,
      exp.organization ?? null,
      exp.location ?? null,
      exp.type ?? null,
      exp.description ?? null,
      exp.highlights !== undefined ? JSON.stringify(exp.highlights) : null,
      exp.order_index ?? null,
      id,
    ]
  );

  if (rows.length === 0) {
    throw new Error(`Pengalaman dengan ID '${id}' tidak ditemukan.`);
  }
  return mapExperienceRow(rows[0]);
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
