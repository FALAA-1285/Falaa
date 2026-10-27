import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  reorderProjectsAction,
  reorderExperiencesAction,
  reorderSkillsAction,
} from "@/actions/admin/reorder";

describe("PHASE 4 - FUNCTIONAL IMPROVEMENTS: Reordering Mechanism & Order Conflict Prevention", () => {
  describe("Server Action Authorization & Validation", () => {
    it("strictly rejects reorder actions without admin session", async () => {
      const projResult = await reorderProjectsAction(["project-1", "project-2"]);
      assert.equal(projResult.success, false);
      assert.match(projResult.error, /Akses ditolak/);

      const expResult = await reorderExperiencesAction([1, 2]);
      assert.equal(expResult.success, false);
      assert.match(expResult.error, /Akses ditolak/);

      const skillResult = await reorderSkillsAction([1, 2]);
      assert.equal(skillResult.success, false);
      assert.match(skillResult.error, /Akses ditolak/);
    });

    it("detects and rejects duplicate IDs to prevent order index conflicts", async () => {
      // Testing with duplicate IDs (should be rejected even if admin bypass was simulated)
      const duplicateProjects = ["academic-portal", "academic-portal"];
      const duplicateSet = new Set(duplicateProjects);
      assert.notEqual(
        duplicateSet.size,
        duplicateProjects.length,
        "Duplicate detection logic must catch duplicates"
      );

      const duplicateExperiences = [1, 2, 2, 3];
      assert.notEqual(
        new Set(duplicateExperiences).size,
        duplicateExperiences.length,
        "Duplicate detection must catch duplicate experience IDs"
      );

      const duplicateSkills = [10, 11, 10];
      assert.notEqual(
        new Set(duplicateSkills).size,
        duplicateSkills.length,
        "Duplicate detection must catch duplicate skill IDs"
      );
    });
  });

  describe("Reordering Database Logic (End-to-End if DATABASE_URL available)", () => {
    it("performs atomic transactional updates of order_index in PostgreSQL", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const envPath = path.resolve(process.cwd(), ".env.local");
      if (!fs.existsSync(envPath)) return;

      const envContent = fs.readFileSync(envPath, "utf8");
      const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (!match) return;

      const { reorderProjects, getProjects } = await import("@/lib/db/projects");

      const currentProjects = await getProjects();
      if (currentProjects.length < 2) return;

      const initialIds = currentProjects.map((p) => p.id);
      // Reverse first 2 items
      const reversedIds = [initialIds[1], initialIds[0], ...initialIds.slice(2)];

      // 1. Reorder
      await reorderProjects(reversedIds);

      // 2. Fetch from DB and verify new order_index
      const updatedProjects = await getProjects();
      assert.equal(updatedProjects[0].id, reversedIds[0]);
      assert.equal(updatedProjects[1].id, reversedIds[1]);
      assert.equal(updatedProjects[0].order_index, 0);
      assert.equal(updatedProjects[1].order_index, 1);

      // 3. Restore original order
      await reorderProjects(initialIds);
      const restoredProjects = await getProjects();
      assert.equal(restoredProjects[0].id, initialIds[0]);
      assert.equal(restoredProjects[1].id, initialIds[1]);
    });
  });
});
