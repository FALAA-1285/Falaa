import { unstable_cache, updateTag, revalidateTag } from "next/cache";
import {
  getProjects,
  getExperiences,
  getSkillsGrouped,
  getProfileInfo,
} from "@/lib/db";

export const PORTFOLIO_CACHE_TAG = "portfolio-data";

/**
 * Cached PostgreSQL query for projects (revalidated on CMS mutation)
 */
export const getCachedProjects = unstable_cache(
  async () => getProjects(),
  ["portfolio-projects-cache"],
  { tags: [PORTFOLIO_CACHE_TAG, "projects"], revalidate: 3600 }
);

/**
 * Cached PostgreSQL query for experiences
 */
export const getCachedExperiences = unstable_cache(
  async () => getExperiences(),
  ["portfolio-experiences-cache-v5"],
  { tags: [PORTFOLIO_CACHE_TAG, "experiences"], revalidate: 3600 }
);

/**
 * Cached PostgreSQL query for grouped skills
 */
export const getCachedSkillsGrouped = unstable_cache(
  async () => getSkillsGrouped(),
  ["portfolio-skills-cache-v3"],
  { tags: [PORTFOLIO_CACHE_TAG, "skills"], revalidate: 3600 }
);

/**
 * Cached PostgreSQL query for profile & hero/about/cta info
 */
export const getCachedProfileInfo = unstable_cache(
  async () => getProfileInfo(),
  ["portfolio-profile-cache"],
  { tags: [PORTFOLIO_CACHE_TAG, "profile"], revalidate: 3600 }
);

/**
 * Purge portfolio cache on demand in Next.js 16 Server Actions
 */
export function invalidatePortfolioCache(): void {
  try {
    updateTag(PORTFOLIO_CACHE_TAG);
  } catch {
    revalidateTag(PORTFOLIO_CACHE_TAG, "max");
  }
}
