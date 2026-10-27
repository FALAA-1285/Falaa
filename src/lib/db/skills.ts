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

export async function createSkill(
  skill: { name: string; category: string; icon: string }
): Promise<SkillItem> {
  const { rows } = await pool.query(
    `INSERT INTO skills (category, name, icon, order_index)
     VALUES ($1, $2, $3, (SELECT COALESCE(MAX(order_index), 0) + 1 FROM skills WHERE category = $1))
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

export async function updateSkill(
  id: number,
  skill: { name?: string; category?: string; icon?: string; order_index?: number }
): Promise<SkillItem> {
  const { rows: currentRows } = await pool.query("SELECT * FROM skills WHERE id = $1", [id]);
  if (currentRows.length === 0) {
    throw new Error(`Skill dengan ID '${id}' tidak ditemukan.`);
  }
  const curr = currentRows[0];
  const name = skill.name ?? curr.name;
  const category = skill.category ?? curr.category;
  const icon = skill.icon ?? curr.icon;
  const orderIndex = skill.order_index !== undefined ? skill.order_index : curr.order_index;

  const { rows } = await pool.query(
    `UPDATE skills
     SET name = $1, category = $2, icon = $3, order_index = $4
     WHERE id = $5
     RETURNING id, category, name, icon, order_index`,
    [name, category, icon, orderIndex, id]
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

export async function deleteSkill(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM skills WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}

/**
 * Persistently update the display order for skills in a single database transaction.
 * Guarantees zero duplicate order conflicts.
 */
export async function reorderSkills(orderedIds: number[]): Promise<boolean> {
  if (!orderedIds || orderedIds.length === 0) return true;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let index = 0; index < orderedIds.length; index++) {
      await client.query(
        "UPDATE skills SET order_index = $1 WHERE id = $2",
        [index, orderedIds[index]]
      );
    }
    await client.query("COMMIT");
    return true;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
