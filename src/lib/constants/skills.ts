/**
 * Single source of truth for Skill Categories, Priorities, and Presets.
 * Used across the public frontend, admin dashboard, and database sorting.
 */

export interface SkillCategoryDefinition {
  id: string;
  label: string;
  priority: number;
  aliases: string[];
}

export const SKILL_CATEGORY_DEFINITIONS: readonly SkillCategoryDefinition[] = [
  {
    id: "programming-languages",
    label: "Programming Languages",
    priority: 1,
    aliases: ["bahasa", "programming", "language"],
  },
  {
    id: "frontend",
    label: "Frontend",
    priority: 2,
    aliases: ["frontend", "front-end", "front end"],
  },
  {
    id: "backend",
    label: "Backend",
    priority: 3,
    aliases: ["backend", "back-end", "back end", "beckend"],
  },
  {
    id: "databases",
    label: "Databases",
    priority: 4,
    aliases: ["database", "basis data", "sql", "db"],
  },
  {
    id: "tools",
    label: "Tools & Others",
    priority: 5,
    aliases: ["tool", "machine learning", "alat", "devops"],
  },
] as const;

/**
 * Default preset categories available in the Admin Skill creation form.
 */
export const PRESET_SKILL_CATEGORIES: string[] = SKILL_CATEGORY_DEFINITIONS.map(
  (c) => c.label
);

/**
 * Compute numeric sorting priority for any category name (case-insensitive substring match).
 * Priority 1 (highest) to 5, default 10 for unmapped / custom categories.
 */
export function getCategoryPriority(category: string): number {
  const norm = (category || "").toLowerCase().trim();
  for (const def of SKILL_CATEGORY_DEFINITIONS) {
    if (def.aliases.some((alias) => norm.includes(alias))) {
      return def.priority;
    }
  }
  return 10;
}

/**
 * Standard comparator to sort categories or items by category priority then alphabetically.
 */
export function compareCategories(categoryA: string, categoryB: string): number {
  const pA = getCategoryPriority(categoryA);
  const pB = getCategoryPriority(categoryB);
  if (pA !== pB) return pA - pB;
  return categoryA.localeCompare(categoryB);
}
