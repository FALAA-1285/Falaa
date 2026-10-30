import test, { describe, it, after } from "node:test";
import assert from "node:assert/strict";

import { signAdminToken, ADMIN_COOKIE_NAME, requireAdminSession } from "@/lib/auth";
import { getClientIp } from "@/lib/rate-limit";
import { parseJsonArray } from "@/lib/db/json";
import { experienceSchema, updateExperienceSchema } from "@/lib/schemas/experience";
import { skillSchema, updateSkillSchema } from "@/lib/schemas/skill";
import { projectSchema } from "@/lib/schemas/project";
import {
  createProjectAction,
  updateProjectAction,
  deleteProjectAction,
} from "@/actions/admin/projects";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "@/actions/admin/experiences";
import { createSkillAction, updateSkillAction, deleteSkillAction } from "@/actions/admin/skills";
import { toggleMessageReadAction, deleteMessageAction } from "@/actions/admin/messages";
import {
  reorderProjectsAction,
  reorderExperiencesAction,
  reorderSkillsAction,
} from "@/actions/admin/reorder";
import { sendContactMessageAction } from "@/actions/contact";
import { rateLimiter } from "@/lib/rate-limit";
import { testCookieStore, testHeaderOverrides } from "./stubs/next-headers.mjs";

const hasTestDb = Boolean(process.env.TEST_DATABASE_URL);
const dbOnly = { skip: !hasTestDb && "TEST_DATABASE_URL not set" };

async function loginAsAdmin() {
  const token = await signAdminToken({ email: "admin@falah.dev", role: "ADMIN" });
  testCookieStore.set(ADMIN_COOKIE_NAME, token);
}

const validProject = (id) => ({
  id,
  title: "Audit Test Project",
  category: "Web & Fullstack",
  tagline: "Regression test tagline",
  description: "Project created by the backend audit regression suite.",
  image: "/projects/project-1.svg",
  tags: ["Next.js"],
  githubUrl: "https://github.com/example/repo",
  liveUrl: "https://example.com",
  features: ["Feature one"],
  metrics: "100% tested",
});

describe("BACKEND AUDIT - Regression & Integration Tests", () => {
  test.beforeEach(() => {
    testCookieStore.clear();
    testHeaderOverrides.clear();
    delete process.env.TRUST_CLOUDFLARE_IP;
  });

  after(async () => {
    const { pool } = await import("@/lib/db/pool");
    await pool.end().catch(() => {});
  });

  /* ------------------------------------------------------------------ */
  /* Unit: validation schemas                                           */
  /* ------------------------------------------------------------------ */
  describe("Update schemas never inject defaults (order_index reset bug)", () => {
    it("updateExperienceSchema keeps omitted fields undefined", () => {
      const parsed = updateExperienceSchema.parse({ role: "Engineer" });
      assert.deepEqual(parsed, { role: "Engineer" });
    });

    it("updateSkillSchema keeps omitted fields undefined", () => {
      const parsed = updateSkillSchema.parse({ name: "Go" });
      assert.deepEqual(parsed, { name: "Go" });
    });

    it("create schemas still apply their defaults", () => {
      const exp = experienceSchema.parse({
        period: "2026",
        role: "Dev",
        organization: "Org",
        description: "Long enough description",
      });
      assert.equal(exp.location, "Malang, Indonesia");
      assert.equal(exp.type, "Work");
      assert.deepEqual(exp.highlights, []);

      const skill = skillSchema.parse({ name: "Go", category: "Backend" });
      assert.equal(skill.icon, "nextjs.svg");
    });

    it("rejects negative order_index", () => {
      assert.equal(updateSkillSchema.safeParse({ order_index: -1 }).success, false);
      assert.equal(updateExperienceSchema.safeParse({ order_index: -5 }).success, false);
    });
  });

  describe("projectSchema enforces bounds aligned with DB columns", () => {
    it("rejects an ID longer than VARCHAR(100)", () => {
      const r = projectSchema.safeParse(validProject("a".repeat(101)));
      assert.equal(r.success, false);
    });

    it("rejects a title longer than VARCHAR(255)", () => {
      const r = projectSchema.safeParse({ ...validProject("ok-id"), title: "t".repeat(256) });
      assert.equal(r.success, false);
    });

    it("rejects unbounded tag and feature lists", () => {
      const tooManyTags = Array.from({ length: 31 }, (_, i) => `tag${i}`);
      assert.equal(projectSchema.safeParse({ ...validProject("ok-id"), tags: tooManyTags }).success, false);
      const longFeature = ["f".repeat(501)];
      assert.equal(projectSchema.safeParse({ ...validProject("ok-id"), features: longFeature }).success, false);
    });

    it("accepts a normal project", () => {
      assert.equal(projectSchema.safeParse(validProject("ok-id")).success, true);
    });
  });

  describe("parseJsonArray", () => {
    it("handles arrays, JSON strings, malformed and empty input", () => {
      assert.deepEqual(parseJsonArray(["a"]), ["a"]);
      assert.deepEqual(parseJsonArray('["b"]'), ["b"]);
      assert.deepEqual(parseJsonArray("{not json"), []);
      assert.deepEqual(parseJsonArray('{"a":1}'), []);
      assert.deepEqual(parseJsonArray(null), []);
      assert.deepEqual(parseJsonArray(""), []);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Security: auth guard and IP resolution                             */
  /* ------------------------------------------------------------------ */
  describe("requireAdminSession (Data Access Layer guard)", () => {
    it("redirects to /admin/login without a session", async () => {
      await assert.rejects(requireAdminSession(), (err) => {
        assert.match(err.digest, /NEXT_REDIRECT;.*\/admin\/login/);
        return true;
      });
    });

    it("redirects when the token is forged", async () => {
      testCookieStore.set(ADMIN_COOKIE_NAME, "eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4ifQ.forged");
      await assert.rejects(requireAdminSession(), /NEXT_REDIRECT/);
    });

    it("returns the admin payload with a valid session", async () => {
      await loginAsAdmin();
      const session = await requireAdminSession();
      assert.equal(session.role, "ADMIN");
    });
  });

  describe("getClientIp resists header spoofing", () => {
    it("ignores client-supplied cf-connecting-ip by default", async () => {
      testHeaderOverrides.set("cf-connecting-ip", "6.6.6.6");
      assert.equal(await getClientIp(), "127.0.0.1");
    });

    it("trusts cf-connecting-ip only when TRUST_CLOUDFLARE_IP=true", async () => {
      process.env.TRUST_CLOUDFLARE_IP = "true";
      testHeaderOverrides.set("cf-connecting-ip", "6.6.6.6");
      assert.equal(await getClientIp(), "6.6.6.6");
    });

    it("rotating cf-connecting-ip cannot bypass the contact rate limit", async () => {
      rateLimiter.reset("contact-form:127.0.0.1");
      const invalid = { name: "", email: "x", message: "" }; // fails validation, still counted
      for (let i = 0; i < 5; i++) {
        testHeaderOverrides.set("cf-connecting-ip", `10.0.0.${i + 1}`);
        await sendContactMessageAction(invalid);
      }
      testHeaderOverrides.set("cf-connecting-ip", "10.0.0.99");
      const res = await sendContactMessageAction(invalid);
      assert.match(res.error, /Terlalu banyak pengiriman pesan/);
      rateLimiter.reset("contact-form:127.0.0.1");
    });
  });

  /* ------------------------------------------------------------------ */
  /* Reorder action input validation (real action calls)                */
  /* ------------------------------------------------------------------ */
  describe("Reorder actions validate input as admin", () => {
    test.beforeEach(loginAsAdmin);

    it("rejects duplicate IDs", async () => {
      const r = await reorderExperiencesAction([1, 2, 2]);
      assert.equal(r.success, false);
      assert.match(r.error, /duplikasi/);
    });

    it("rejects wrong element types", async () => {
      assert.equal((await reorderSkillsAction(["1", "2"])).success, false);
      assert.equal((await reorderSkillsAction([1.5, 2])).success, false);
      assert.equal((await reorderProjectsAction([1, 2])).success, false);
      assert.equal((await reorderProjectsAction("abc")).success, false);
    });

    it("rejects empty and oversized lists", async () => {
      assert.equal((await reorderSkillsAction([])).success, false);
      const huge = Array.from({ length: 501 }, (_, i) => i + 1);
      assert.match((await reorderSkillsAction(huge)).error, /tidak valid/);
    });
  });

  /* ------------------------------------------------------------------ */
  /* Integration: real PostgreSQL (TEST_DATABASE_URL only)              */
  /* ------------------------------------------------------------------ */
  describe("Integration: edits preserve display order and data", () => {
    test.beforeEach(loginAsAdmin);

    it("editing a skill from the admin form keeps its order_index", dbOnly, async () => {
      const created = await createSkillAction({ name: "AuditSkill", category: "Backend", icon: "go.svg" });
      assert.equal(created.success, true, created.error);
      const id = created.skill.id;
      try {
        const { pool } = await import("@/lib/db/pool");
        await pool.query("UPDATE skills SET order_index = 42 WHERE id = $1", [id]);

        const res = await updateSkillAction(id, { name: "AuditSkill2", category: "Backend", icon: "go.svg" });
        assert.equal(res.success, true, res.error);
        assert.equal(res.skill.name, "AuditSkill2");
        assert.equal(res.skill.order_index, 42, "order_index must not reset to 0");

        const partial = await updateSkillAction(id, { name: "AuditSkill3" });
        assert.equal(partial.skill.icon, "go.svg", "partial update must not reset icon to default");
        assert.equal(partial.skill.order_index, 42);
      } finally {
        await deleteSkillAction(id);
      }
    });

    it("editing an experience keeps order_index and unspecified fields", dbOnly, async () => {
      const created = await createExperienceAction({
        period: "2026",
        role: "Audit Engineer",
        organization: "Audit Org",
        location: "Jakarta, Indonesia",
        type: "Internship",
        description: "Created by the audit suite.",
        highlights: ["one", "two"],
      });
      assert.equal(created.success, true, created.error);
      const id = created.experience.id;
      try {
        const { pool } = await import("@/lib/db/pool");
        await pool.query("UPDATE experiences SET order_index = 7 WHERE id = $1", [id]);

        const res = await updateExperienceAction(id, { role: "Senior Audit Engineer" });
        assert.equal(res.success, true, res.error);
        assert.equal(res.experience.role, "Senior Audit Engineer");
        assert.equal(res.experience.order_index, 7, "order_index must not reset to 0");
        assert.equal(res.experience.location, "Jakarta, Indonesia", "location must not reset to default");
        assert.equal(res.experience.type, "Internship", "type must not reset to default");
        assert.deepEqual(res.experience.highlights, ["one", "two"], "highlights must not be wiped");
      } finally {
        await deleteExperienceAction(id);
      }
    });

    it("editing a project keeps order_index and can clear optional URLs", dbOnly, async () => {
      const id = `audit-test-${Date.now()}`;
      const created = await createProjectAction(validProject(id));
      assert.equal(created.success, true, created.error);
      try {
        const { pool } = await import("@/lib/db/pool");
        await pool.query("UPDATE projects SET order_index = 9 WHERE id = $1", [id]);

        const res = await updateProjectAction(id, { ...validProject(id), title: "Renamed", githubUrl: "", metrics: "" });
        assert.equal(res.success, true, res.error);
        assert.equal(res.project.title, "Renamed");
        assert.equal(res.project.order_index, 9, "order_index must not reset to 0");
        assert.equal(res.project.githubUrl, undefined, "clearing githubUrl must persist");
        assert.equal(res.project.metrics, undefined, "clearing metrics must persist");
        assert.equal(res.project.liveUrl, "https://example.com");
      } finally {
        await deleteProjectAction(id);
      }
    });

    it("updates on missing records report not found", dbOnly, async () => {
      assert.match((await updateSkillAction(999999, { name: "x" })).error, /tidak ditemukan/);
      assert.match((await updateExperienceAction(999999, { role: "x" })).error, /tidak ditemukan/);
      assert.match(
        (await updateProjectAction("does-not-exist", validProject("does-not-exist"))).error,
        /tidak ditemukan/
      );
      assert.match((await deleteProjectAction("does-not-exist")).error, /tidak ditemukan/);
    });

    it("duplicate project ID is rejected with a safe message", dbOnly, async () => {
      const id = `audit-dup-${Date.now()}`;
      await createProjectAction(validProject(id));
      try {
        const dup = await createProjectAction(validProject(id));
        assert.equal(dup.success, false);
        assert.match(dup.error, /sudah terdaftar/);
      } finally {
        await deleteProjectAction(id);
      }
    });
  });

  describe("Integration: messages", () => {
    it("contact submission persists and admin can toggle/delete it", dbOnly, async () => {
      rateLimiter.reset("contact-form:127.0.0.1");
      const sent = await sendContactMessageAction({
        name: "Audit Visitor",
        email: "audit@example.com",
        subject: "Audit",
        message: "Integration test message body.",
      });
      assert.equal(sent.success, true, sent.error);

      const { pool } = await import("@/lib/db/pool");
      const { rows } = await pool.query(
        "SELECT id, is_read FROM messages WHERE email = 'audit@example.com' ORDER BY id DESC LIMIT 1"
      );
      const id = rows[0].id;
      assert.equal(rows[0].is_read, false);

      // unauthenticated admin operations are rejected
      assert.match((await deleteMessageAction(id)).error, /Akses ditolak/);

      await loginAsAdmin();
      assert.equal((await toggleMessageReadAction(id, true)).success, true);
      const after = await pool.query("SELECT is_read FROM messages WHERE id = $1", [id]);
      assert.equal(after.rows[0].is_read, true);

      assert.equal((await deleteMessageAction(id)).success, true);
      assert.match((await deleteMessageAction(id)).error, /tidak ditemukan/);
      assert.match((await toggleMessageReadAction(id, false)).error, /tidak ditemukan/);
      rateLimiter.reset("contact-form:127.0.0.1");
    });

    it("honeypot submissions are not persisted", dbOnly, async () => {
      rateLimiter.reset("contact-form:127.0.0.1");
      const { pool } = await import("@/lib/db/pool");
      const before = (await pool.query("SELECT count(*)::int n FROM messages")).rows[0].n;
      const res = await sendContactMessageAction({
        name: "Bot",
        email: "bot@example.com",
        message: "Buy now buy now",
        honeypot: "filled",
      });
      assert.equal(res.success, true);
      const afterCount = (await pool.query("SELECT count(*)::int n FROM messages")).rows[0].n;
      assert.equal(afterCount, before);
      rateLimiter.reset("contact-form:127.0.0.1");
    });
  });
});
