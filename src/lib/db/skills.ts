import { pool } from "./pool";
import { SkillCategoryGroup, SkillItem } from "@/types/skills";
import { DEFAULT_SKILLS } from "@/lib/constants";

function getCategoryPriority(category: string): number {
  const norm = category.toLowerCase().trim();
  // 1. Bahasa Pemrograman / Programming Languages
  if (norm.includes("bahasa") || norm.includes("programming") || norm.includes("language")) {
    return 1;
  }
  // 2. Frontend
  if (norm.includes("frontend") || norm.includes("front-end") || norm.includes("front end")) {
    return 2;
  }
  // 3. Backend
  if (norm.includes("backend") || norm.includes("back-end") || norm.includes("back end") || norm.includes("beckend")) {
    return 3;
  }
  // 4. Databases (compliments backend)
  if (norm.includes("database") || norm.includes("basis data") || norm.includes("sql")) {
    return 4;
  }
  // 5. Tools & Machine Learning / Tools
  if (norm.includes("tool") || norm.includes("machine learning") || norm.includes("alat") || norm.includes("devops")) {
    return 5;
  }
  return 10;
}

export async function getSkills(): Promise<SkillItem[]> {
  try {
    const { rows } = await pool.query(
      `SELECT id, category, name, icon, order_index
       FROM skills
       ORDER BY 
         CASE 
           WHEN LOWER(category) LIKE '%bahasa%' OR LOWER(category) LIKE '%programming%' OR LOWER(category) LIKE '%language%' THEN 1
           WHEN LOWER(category) LIKE '%frontend%' OR LOWER(category) LIKE '%front-end%' OR LOWER(category) LIKE '%front end%' THEN 2
           WHEN LOWER(category) LIKE '%backend%' OR LOWER(category) LIKE '%back-end%' OR LOWER(category) LIKE '%back end%' OR LOWER(category) LIKE '%beckend%' THEN 3
           WHEN LOWER(category) LIKE '%database%' OR LOWER(category) LIKE '%basis data%' OR LOWER(category) LIKE '%sql%' OR LOWER(category) LIKE '%db%' THEN 4
           WHEN LOWER(category) LIKE '%tool%' OR LOWER(category) LIKE '%machine learning%' OR LOWER(category) LIKE '%alat%' OR LOWER(category) LIKE '%devops%' THEN 5
           ELSE 10
         END ASC,
         order_index ASC, 
         id ASC`
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
      const pA = getCategoryPriority(a.category || "");
      const pB = getCategoryPriority(b.category || "");
      if (pA !== pB) return pA - pB;
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

  // Ensure groups strictly follow: 1. Programming Languages, 2. Frontend, 3. Backend, 4. Databases, 5. Tools
  groups.sort((a, b) => {
    const pA = getCategoryPriority(a.category);
    const pB = getCategoryPriority(b.category);
    if (pA !== pB) return pA - pB;
    return a.category.localeCompare(b.category);
  });

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
  skill: { name?: string; category?: string; icon?: string }
): Promise<SkillItem> {
  const { rows: currentRows } = await pool.query("SELECT * FROM skills WHERE id = $1", [id]);
  if (currentRows.length === 0) {
    throw new Error(`Skill dengan ID '${id}' tidak ditemukan.`);
  }
  const curr = currentRows[0];
  const name = skill.name ?? curr.name;
  const category = skill.category ?? curr.category;
  const icon = skill.icon ?? curr.icon;

  const { rows } = await pool.query(
    `UPDATE skills
     SET name = $1, category = $2, icon = $3
     WHERE id = $4
     RETURNING id, category, name, icon, order_index`,
    [name, category, icon, id]
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
