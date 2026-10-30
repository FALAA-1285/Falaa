import { pool } from "./pool";
import type { SkillCategoryGroup, SkillItem } from "@/types/skills";
import { DEFAULT_SKILLS } from "@/lib/constants";
import { compareCategories } from "@/lib/constants/skills";

export async function getSkills(): Promise<SkillItem[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, category, name, icon, order_index
       FROM skills
       ORDER BY order_index ASC, id ASC`
    );
    const skillsList = rows.map((r) => ({
      id: r.id,
      category: r.category,
      name: r.name,
      icon: r.icon,
      order_index: r.order_index,
    }));

    // Sort by desired category hierarchy, then order_index
    skillsList.sort((a, b) => {
      const catCompare = compareCategories(a.category || "", b.category || "");
      if (catCompare !== 0) return catCompare;
      return (a.order_index || 0) - (b.order_index || 0);
    });

    if (skillsList.length === 0) {
      return DEFAULT_SKILLS;
    }
    return skillsList;
  } catch (error) {
    console.error("Error fetching skills from PostgreSQL:", error);
    return DEFAULT_SKILLS;
  }
}

export async function getSkillsGrouped(): Promise<SkillCategoryGroup[]> {
  const allSkills = await getSkills();
  const groupMap = new Map<string, SkillItem[]>();

  for (const s of allSkills) {
    const cat = s.category || "General";
    if (!groupMap.has(cat)) {
      groupMap.set(cat, []);
    }
    groupMap.get(cat)!.push({
      id: s.id,
      name: s.name,
      icon: s.icon,
      order_index: s.order_index,
    });
  }

  const groups = Array.from(groupMap.entries()).map(([category, skills]) => ({
    category,
    skills,
  }));

  // Ensure groups strictly follow single source of truth category hierarchy
  groups.sort((a, b) => compareCategories(a.category, b.category));

  return groups;
}

// $1 is used twice; the explicit ::text cast is required, otherwise Postgres fails with
// "inconsistent types deduced for parameter $1".
export async function createSkill(
  skill: { name: string; category: string; icon: string }
): Promise<SkillItem> {
  const { rows } = await pool.query(
    `INSERT INTO skills (category, name, icon, order_index)
     VALUES ($1::text, $2, $3, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM skills WHERE category = $1::text))
     RETURNING id, category, name, icon, order_index`,
    [skill.category, skill.name, skill.icon]
  );
  const r = rows[0];
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    icon: r.icon,
    order_index: r.order_index,
  };
}

/**
 * Update a skill. Fields left `undefined` keep their stored value
 * (single atomic statement, no read-before-write).
 */
export async function updateSkill(
  id: number,
  skill: { name?: string; category?: string; icon?: string; order_index?: number }
): Promise<SkillItem> {
  const { rows } = await pool.query(
    `UPDATE skills
     SET name = COALESCE($1, name),
         category = COALESCE($2, category),
         icon = COALESCE($3, icon),
         order_index = COALESCE($4, order_index)
     WHERE id = $5
     RETURNING id, category, name, icon, order_index`,
    [skill.name ?? null, skill.category ?? null, skill.icon ?? null, skill.order_index ?? null, id]
  );

  if (rows.length === 0) {
    throw new Error(`Skill dengan ID '${id}' tidak ditemukan.`);
  }

  const r = rows[0];
  return {
    id: r.id,
    category: r.category,
    name: r.name,
    icon: r.icon,
    order_index: r.order_index,
  };
}

export async function deleteSkill(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM skills WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Persistently update the display order for skills in a high-performance single batch query.
 * Guarantees zero duplicate order conflicts and eliminates N roundtrip network latency.
 */
export async function reorderSkills(orderedIds: number[]): Promise<boolean> {
  if (!orderedIds || orderedIds.length === 0) return true;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const orderIndices = orderedIds.map((_, index) => index);
    await client.query(
      `UPDATE skills AS s
       SET order_index = v.new_order
       FROM (
         SELECT unnest($1::int[]) AS id,
                unnest($2::int[]) AS new_order
       ) AS v
       WHERE s.id = v.id`,
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
