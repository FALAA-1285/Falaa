import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  getCategoryPriority,
  compareCategories,
  PRESET_SKILL_CATEGORIES,
  SKILL_CATEGORY_DEFINITIONS,
} from "@/lib/constants/skills";
import { experienceSchema, updateExperienceSchema } from "@/lib/schemas/experience";
import { skillSchema, updateSkillSchema } from "@/lib/schemas/skill";

describe("PHASE 3 - CODE REFACTORING: Single Source of Truth & DRY Validation", () => {
  describe("Skill Category Single Source of Truth", () => {
    it("maps categories accurately according to canonical priority rules", () => {
      // 1. Programming Languages
      assert.equal(getCategoryPriority("Programming Languages"), 1);
      assert.equal(getCategoryPriority("Bahasa Pemrograman"), 1);
      assert.equal(getCategoryPriority("programming"), 1);
      assert.equal(getCategoryPriority("Language"), 1);

      // 2. Frontend
      assert.equal(getCategoryPriority("Frontend"), 2);
      assert.equal(getCategoryPriority("front-end"), 2);
      assert.equal(getCategoryPriority("Front End"), 2);

      // 3. Backend
      assert.equal(getCategoryPriority("Backend"), 3);
      assert.equal(getCategoryPriority("back-end"), 3);
      assert.equal(getCategoryPriority("beckend"), 3);

      // 4. Databases
      assert.equal(getCategoryPriority("Databases"), 4);
      assert.equal(getCategoryPriority("database"), 4);
      assert.equal(getCategoryPriority("Basis Data"), 4);
      assert.equal(getCategoryPriority("SQL"), 4);

      // 5. Tools & Machine Learning
      assert.equal(getCategoryPriority("Tools & Machine Learning"), 5);
      assert.equal(getCategoryPriority("Tools"), 5);
      assert.equal(getCategoryPriority("machine learning"), 5);
      assert.equal(getCategoryPriority("DevOps"), 5);

      // Custom / Unmapped categories
      assert.equal(getCategoryPriority("Custom Design"), 10);
      assert.equal(getCategoryPriority("Other Skills"), 10);
      assert.equal(getCategoryPriority(""), 10);
    });

    it("orders categories via compareCategories deterministically", () => {
      const categories = [
        "Tools & Machine Learning",
        "Frontend",
        "Other Category",
        "Programming Languages",
        "Databases",
        "Backend",
      ];

      const sorted = [...categories].sort(compareCategories);
      assert.deepEqual(sorted, [
        "Programming Languages",
        "Frontend",
        "Backend",
        "Databases",
        "Tools & Machine Learning",
        "Other Category",
      ]);
    });

    it("exposes PRESET_SKILL_CATEGORIES matching definition count", () => {
      assert.equal(PRESET_SKILL_CATEGORIES.length, SKILL_CATEGORY_DEFINITIONS.length);
      assert.ok(PRESET_SKILL_CATEGORIES.includes("Frontend"));
      assert.ok(PRESET_SKILL_CATEGORIES.includes("Backend"));
      assert.ok(PRESET_SKILL_CATEGORIES.includes("Databases"));
    });
  });

  describe("Experience Schema Zod Validation", () => {
    it("validates legitimate experience input", () => {
      const validExp = {
        period: "2024 - Present",
        role: "Full Stack Engineer",
        organization: "Tech Innovation Lab",
        location: "Malang, Indonesia",
        type: "Work",
        description: "Developed and deployed enterprise web applications.",
        highlights: ["Improved performance by 35%", "Architected PostgreSQL database schema"],
        order_index: 0,
      };

      const result = experienceSchema.safeParse(validExp);
      assert.equal(result.success, true);
    });

    it("rejects experience input with missing required fields", () => {
      const invalid = {
        period: "",
        role: "",
        organization: "",
        description: "",
      };
      const result = experienceSchema.safeParse(invalid);
      assert.equal(result.success, false);
      assert.ok(result.error.issues.length >= 4);
    });

    it("validates partial update schema", () => {
      const partialUpdate = {
        role: "Senior Full Stack Engineer",
      };
      const result = updateExperienceSchema.safeParse(partialUpdate);
      assert.equal(result.success, true);
    });
  });

  describe("Skill Schema Zod Validation", () => {
    it("validates legitimate skill input", () => {
      const validSkill = {
        name: "Next.js",
        category: "Frontend",
        icon: "nextjs.svg",
        order_index: 1,
      };

      const result = skillSchema.safeParse(validSkill);
      assert.equal(result.success, true);
    });

    it("rejects dangerous or path traversal icon filenames", () => {
      const dangerousIcons = [
        "../secret.png",
        "../../etc/passwd",
        "/icons/test.svg",
        "\\malicious\\path.svg",
        "<script>alert(1)</script>.png",
        "shell.php",
        "malware.exe",
      ];

      for (const icon of dangerousIcons) {
        const result = skillSchema.safeParse({
          name: "Test",
          category: "Frontend",
          icon,
        });
        assert.equal(
          result.success,
          false,
          `Must reject dangerous icon filename: "${icon}"`
        );
      }
    });

    it("validates partial skill update schema", () => {
      const partialUpdate = {
        name: "React 19",
      };
      const result = updateSkillSchema.safeParse(partialUpdate);
      assert.equal(result.success, true);
    });
  });
});
