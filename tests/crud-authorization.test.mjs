import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  signAdminToken,
  verifyAdminToken,
  resolveJwtSecret,
  ADMIN_COOKIE_NAME,
} from "@/lib/auth";
import { loginAction, logoutAction } from "@/actions/admin/auth";
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
import {
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
} from "@/actions/admin/skills";
import { updateProfileInfoAction } from "@/actions/admin/profile";
import {
  toggleMessageReadAction,
  deleteMessageAction,
} from "@/actions/admin/messages";
import { uploadImageAction } from "@/actions/admin/upload";
import {
  reorderProjectsAction,
  reorderExperiencesAction,
  reorderSkillsAction,
} from "@/actions/admin/reorder";
import { sendContactMessageAction } from "@/actions/contact";
import {
  DEFAULT_PROJECTS,
  DEFAULT_EXPERIENCES,
  DEFAULT_SKILLS,
  DEFAULT_PERSONAL_INFO,
} from "@/lib/constants";
import { projectSchema } from "@/lib/schemas/project";
import { experienceSchema } from "@/lib/schemas/experience";
import { skillSchema } from "@/lib/schemas/skill";
import { profileSchema } from "@/lib/schemas/profile";
import { testCookieStore } from "./stubs/next-headers.mjs";
import { rateLimiter } from "@/lib/rate-limit";

describe("PHASE 7 - AUTOMATED TESTING: Auth, RBAC, CRUD & Critical Business Logic", () => {
  const originalEnv = { ...process.env };

  test.beforeEach(() => {
    testCookieStore.clear();
    process.env = { ...originalEnv };
    process.env.ADMIN_EMAIL = "admin@falah.dev";
    process.env.ADMIN_PASSWORD = "SuperSecurePassword2026!";
    process.env.ADMIN_JWT_SECRET =
      "production_jwt_secret_must_be_at_least_32_characters_long_2026";
  });

  test.afterEach(() => {
    testCookieStore.clear();
    process.env = { ...originalEnv };
  });

  /* -------------------------------------------------------------------------- */
  /* 1. AUTHENTICATION & JWT TOKEN LIFECYCLE                                    */
  /* -------------------------------------------------------------------------- */
  describe("Authentication & JWT Token Lifecycle", () => {
    it("signs and successfully verifies valid admin token", async () => {
      const token = await signAdminToken({
        email: "admin@falah.dev",
        role: "ADMIN",
      });

      assert.ok(typeof token === "string");
      assert.ok(token.split(".").length === 3, "JWT must have 3 segments");

      const session = await verifyAdminToken(token);
      assert.ok(session !== null);
      assert.equal(session.email, "admin@falah.dev");
      assert.equal(session.role, "ADMIN");
    });

    it("rejects tampered or forged JWT tokens", async () => {
      const token = await signAdminToken({
        email: "admin@falah.dev",
        role: "ADMIN",
      });

      // Tamper with signature
      const tampered = token.slice(0, -5) + "abcde";
      const session = await verifyAdminToken(tampered);
      assert.equal(session, null, "Must reject tampered token");
    });

    it("rejects non-admin role in token payload", async () => {
      const { SignJWT } = await import("jose");
      const secret = resolveJwtSecret();
      const fakeToken = await new SignJWT({
        email: "hacker@evil.com",
        role: "USER",
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(secret);

      const session = await verifyAdminToken(fakeToken);
      assert.equal(session, null, "Must reject non-ADMIN role");
    });

    it("rejects empty or malformed strings", async () => {
      assert.equal(await verifyAdminToken(""), null);
      assert.equal(await verifyAdminToken("not.a.token"), null);
      assert.equal(await verifyAdminToken("random_string_123"), null);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 2. ADMIN LOGIN & LOGOUT SERVER ACTIONS                                     */
  /* -------------------------------------------------------------------------- */
  describe("Admin Login & Logout Server Actions", () => {
    it("handles login rate-limiting after failed attempts", async () => {
      const ip = "127.0.0.1";
      rateLimiter.reset(`admin-login:${ip}`);

      for (let i = 0; i < 5; i++) {
        const res = await loginAction({
          email: "admin@falah.dev",
          password: "wrong_password",
        });
        assert.equal(res.success, false);
      }

      // 6th attempt should be rate-limited
      const rateLimitedRes = await loginAction({
        email: "admin@falah.dev",
        password: "SuperSecurePassword2026!",
      });
      assert.equal(rateLimitedRes.success, false);
      assert.match(rateLimitedRes.error, /Terlalu banyak percobaan login/);

      rateLimiter.reset(`admin-login:${ip}`);
    });

    it("authenticates valid login and sets HTTP-only cookie", async () => {
      rateLimiter.reset("admin-login:127.0.0.1");

      const res = await loginAction({
        email: "admin@falah.dev",
        password: "SuperSecurePassword2026!",
      });

      assert.equal(res.success, true);
      const setToken = testCookieStore.get(ADMIN_COOKIE_NAME);
      assert.ok(setToken, "Cookie must be set on successful login");

      const session = await verifyAdminToken(setToken);
      assert.equal(session.email, "admin@falah.dev");
      assert.equal(session.role, "ADMIN");
    });

    it("logoutAction clears admin cookie and triggers redirect", async () => {
      testCookieStore.set(ADMIN_COOKIE_NAME, "mock_token");
      assert.equal(testCookieStore.get(ADMIN_COOKIE_NAME), "mock_token");

      try {
        await logoutAction();
      } catch (err) {
        // next/navigation redirect throws NEXT_REDIRECT in Next.js
        assert.match(err.message, /NEXT_REDIRECT/);
      }

      assert.equal(
        testCookieStore.get(ADMIN_COOKIE_NAME),
        undefined,
        "Cookie must be deleted on logout"
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 3. AUTHORIZATION: STRICT REJECTION FOR UNAUTHENTICATED REQUESTS             */
  /* -------------------------------------------------------------------------- */
  describe("Authorization: Unauthenticated Request Rejection", () => {
    test.beforeEach(() => {
      testCookieStore.clear(); // Ensure unauthenticated state
    });

    it("rejects project mutation actions without admin session", async () => {
      const createRes = await createProjectAction({
        id: "unauth-project",
        title: "Unauth Project",
        category: "Web & Fullstack",
        tagline: "Test Tagline",
        description: "Test Description",
        image: "/projects/test.svg",
        tags: ["Next.js"],
        features: ["Feature 1"],
      });
      assert.equal(createRes.success, false);
      assert.match(createRes.error, /Akses ditolak/);

      const updateRes = await updateProjectAction("unauth-project", {
        title: "Updated",
      });
      assert.equal(updateRes.success, false);
      assert.match(updateRes.error, /Akses ditolak/);

      const deleteRes = await deleteProjectAction("unauth-project");
      assert.equal(deleteRes.success, false);
      assert.match(deleteRes.error, /Akses ditolak/);
    });

    it("rejects experience mutation actions without admin session", async () => {
      const createRes = await createExperienceAction({
        period: "2024",
        role: "Engineer",
        organization: "Lab",
        type: "Work",
        description: "Description",
      });
      assert.equal(createRes.success, false);
      assert.match(createRes.error, /Akses ditolak/);

      const updateRes = await updateExperienceAction(1, { role: "Lead" });
      assert.equal(updateRes.success, false);
      assert.match(updateRes.error, /Akses ditolak/);

      const deleteRes = await deleteExperienceAction(1);
      assert.equal(deleteRes.success, false);
      assert.match(deleteRes.error, /Akses ditolak/);
    });

    it("rejects skill mutation actions without admin session", async () => {
      const createRes = await createSkillAction({
        name: "Rust",
        category: "Backend",
        icon: "rust.svg",
      });
      assert.equal(createRes.success, false);
      assert.match(createRes.error, /Akses ditolak/);

      const updateRes = await updateSkillAction(1, { name: "Rust Lang" });
      assert.equal(updateRes.success, false);
      assert.match(updateRes.error, /Akses ditolak/);

      const deleteRes = await deleteSkillAction(1);
      assert.equal(deleteRes.success, false);
      assert.match(deleteRes.error, /Akses ditolak/);
    });

    it("rejects profile and message mutations without admin session", async () => {
      const profRes = await updateProfileInfoAction({
        name: "Hacker",
        title: "Evil",
        location: "Dark Web",
        email: "hacker@evil.com",
      });
      assert.equal(profRes.success, false);
      assert.match(profRes.error, /Akses ditolak/);

      const msgReadRes = await toggleMessageReadAction(1, true);
      assert.equal(msgReadRes.success, false);
      assert.match(msgReadRes.error, /Akses ditolak/);

      const msgDelRes = await deleteMessageAction(1);
      assert.equal(msgDelRes.success, false);
      assert.match(msgDelRes.error, /Akses ditolak/);
    });

    it("rejects reorder actions without admin session", async () => {
      assert.equal((await reorderProjectsAction(["p1", "p2"])).success, false);
      assert.equal((await reorderExperiencesAction([1, 2])).success, false);
      assert.equal((await reorderSkillsAction([1, 2])).success, false);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 4. AUTHORIZED SERVER ACTIONS & INPUT VALIDATION ENFORCEMENT                 */
  /* -------------------------------------------------------------------------- */
  describe("Authorized Server Actions: Schema Validation on Admin Requests", () => {
    test.beforeEach(async () => {
      // Simulate authenticated admin session
      const token = await signAdminToken({
        email: "admin@falah.dev",
        role: "ADMIN",
      });
      testCookieStore.set(ADMIN_COOKIE_NAME, token);
    });

    it("rejects project creation with dangerous URLs or malformed input even from admin", async () => {
      const invalidProject = {
        id: "xss-project",
        title: "XSS Project",
        category: "Web & Fullstack",
        tagline: "Tagline",
        description: "Description",
        image: "/projects/test.svg",
        tags: ["Test"],
        features: ["Feat"],
        liveUrl: "javascript:alert(document.cookie)", // Stored XSS attempt
      };

      const res = await createProjectAction(invalidProject);
      assert.equal(res.success, false);
      assert.match(res.error, /javascript/);
    });

    it("rejects experience creation with missing required fields from admin", async () => {
      const invalidExp = {
        period: "", // Missing
        role: "",
        organization: "",
        type: "Work",
        description: "",
      };

      const res = await createExperienceAction(invalidExp);
      assert.equal(res.success, false);
      assert.ok(res.error);
    });

    it("rejects skill creation with dangerous icon filename from admin", async () => {
      const dangerousSkill = {
        name: "Malicious",
        category: "Backend",
        icon: "shell.php", // Unallowed extension
      };

      const res = await createSkillAction(dangerousSkill);
      assert.equal(res.success, false);
      assert.match(res.error, /Nama berkas icon tidak valid/);
    });

    it("rejects profile update with invalid email or javascript: links from admin", async () => {
      const dangerousProfile = {
        name: "Admin",
        title: "Developer",
        location: "Indonesia",
        email: "invalid-email-format",
        github: "javascript:alert(1)",
        aboutHeadline: "Hello",
        about: "About text",
      };

      const res = await updateProfileInfoAction(dangerousProfile);
      assert.equal(res.success, false);
      assert.ok(res.error);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 5. PUBLIC CONTACT FORM SECURITY & RATE LIMITING                            */
  /* -------------------------------------------------------------------------- */
  describe("Public Contact Form Submission & Rate Limiting", () => {
    it("submits valid contact message successfully", { skip: !process.env.TEST_DATABASE_URL && "TEST_DATABASE_URL not set" }, async () => {
      rateLimiter.reset("contact-form:127.0.0.1");

      const validMessage = {
        name: "John Doe",
        email: "john@example.com",
        subject: "Collaboration Inquiry",
        message: "Hello Falah, I would like to discuss a web project.",
      };

      const res = await sendContactMessageAction(validMessage);
      assert.equal(res.success, true);
    });

    it("rejects contact messages with CRLF email injection", async () => {
      const malicious = {
        name: "Attacker",
        email: "victim@example.com\r\nBcc: spam@evil.com",
        subject: "Spam",
        message: "Malicious payload",
      };

      const res = await sendContactMessageAction(malicious);
      assert.equal(res.success, false);
      assert.match(res.error, /Format alamat email tidak valid/);
    });

    it("rate limits rapid contact form submissions from the same IP", async () => {
      const ip = "127.0.0.1";
      rateLimiter.reset(`contact-form:${ip}`);

      const validMsg = {
        name: "Spammer",
        email: "spammer@example.com",
        subject: "Spam Offer",
        message: "Spam message content here.",
      };

      // Limit is 5 per 15 minutes
      for (let i = 0; i < 5; i++) {
        await sendContactMessageAction(validMsg);
      }

      // 6th attempt should be blocked
      const blockedRes = await sendContactMessageAction(validMsg);
      assert.equal(blockedRes.success, false);
      assert.match(blockedRes.error, /Terlalu banyak pengiriman pesan/);

      rateLimiter.reset(`contact-form:${ip}`);
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 6. CRITICAL BUSINESS LOGIC: FALLBACK DATA INTEGRITY                        */
  /* -------------------------------------------------------------------------- */
  describe("Critical Business Logic: Fallback Dataset Schema Conformance", () => {
    it("validates that all DEFAULT_PROJECTS strictly satisfy projectSchema", () => {
      assert.ok(DEFAULT_PROJECTS.length >= 6);
      for (const project of DEFAULT_PROJECTS) {
        const parseResult = projectSchema.safeParse(project);
        assert.ok(
          parseResult.success,
          `DEFAULT_PROJECTS item "${project.id}" must pass projectSchema validation: ${JSON.stringify(parseResult.error?.issues)}`
        );
      }
    });

    it("validates that all DEFAULT_EXPERIENCES strictly satisfy experienceSchema", () => {
      assert.ok(DEFAULT_EXPERIENCES.length >= 3);
      for (const exp of DEFAULT_EXPERIENCES) {
        const parseResult = experienceSchema.safeParse(exp);
        assert.ok(
          parseResult.success,
          `DEFAULT_EXPERIENCES item "${exp.role}" must pass experienceSchema: ${JSON.stringify(parseResult.error?.issues)}`
        );
      }
    });

    it("validates that all DEFAULT_SKILLS strictly satisfy skillSchema", () => {
      assert.ok(DEFAULT_SKILLS.length >= 20);
      for (const skill of DEFAULT_SKILLS) {
        const parseResult = skillSchema.safeParse(skill);
        assert.ok(
          parseResult.success,
          `DEFAULT_SKILLS item "${skill.name}" must pass skillSchema: ${JSON.stringify(parseResult.error?.issues)}`
        );
      }
    });

    it("validates that DEFAULT_PERSONAL_INFO strictly satisfies profileSchema", () => {
      const parseResult = profileSchema.safeParse(DEFAULT_PERSONAL_INFO);
      assert.ok(
        parseResult.success,
        `DEFAULT_PERSONAL_INFO must pass profileSchema: ${JSON.stringify(parseResult.error?.issues)}`
      );
    });
  });

  /* -------------------------------------------------------------------------- */
  /* 7. LIVE DATABASE CRUD OPERATIONS (if PostgreSQL is connected)              */
  /* -------------------------------------------------------------------------- */
  describe("Live PostgreSQL CRUD Operations & Query Resilience", () => {
    it("verifies read operations succeed and return structured arrays", async () => {
      const { getProjects, getExperiences, getSkills, getProfileInfo, getMessages } =
        await import("@/lib/db");

      const [projects, experiences, skills, profile, messages] = await Promise.all([
        getProjects(),
        getExperiences(),
        getSkills(),
        getProfileInfo(),
        getMessages(),
      ]);

      assert.ok(Array.isArray(projects));
      assert.ok(Array.isArray(experiences));
      assert.ok(Array.isArray(skills));
      assert.ok(typeof profile === "object" && profile !== null);
      assert.ok(Array.isArray(messages));
    });
  });
});
