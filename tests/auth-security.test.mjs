import test, { describe, it } from "node:test";
import assert from "node:assert/strict";

import { validateAdminCredentials } from "@/lib/auth-credentials";
import { resolveJwtSecret } from "@/lib/auth";
import { rateLimiter } from "@/lib/rate-limit";
import { contactFormSchema } from "@/lib/schemas/contact";

describe("PHASE 1 - SECURITY FIXES: Authentication & Credential Hardening", () => {
  const originalEnv = { ...process.env };

  test.afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("validateAdminCredentials security checks", () => {
    it("strictly rejects empty, null, or undefined inputs", () => {
      assert.equal(validateAdminCredentials("", ""), false);
      assert.equal(validateAdminCredentials("admin@falah.dev", ""), false);
      assert.equal(validateAdminCredentials("", "password123"), false);
      assert.equal(validateAdminCredentials(null, "password123"), false);
    });

    it("strictly rejects logins in production when ADMIN_PASSWORD is missing (no default fallback)", () => {
      process.env.NODE_ENV = "production";
      delete process.env.ADMIN_PASSWORD;
      process.env.ADMIN_EMAIL = "admin@falah.dev";

      // Attempting to login with the former default "admin123" must fail in production
      const result = validateAdminCredentials("admin@falah.dev", "admin123");
      assert.equal(result, false, "Must reject login in production when ADMIN_PASSWORD is not set");
    });

    it("strictly rejects logins in production when ADMIN_PASSWORD is shorter than 8 characters", () => {
      process.env.NODE_ENV = "production";
      process.env.ADMIN_EMAIL = "admin@falah.dev";
      process.env.ADMIN_PASSWORD = "short";

      const result = validateAdminCredentials("admin@falah.dev", "short");
      assert.equal(result, false, "Must reject weak passwords under 8 characters in production");
    });

    it("authenticates valid credentials when environment variables are properly configured", () => {
      process.env.NODE_ENV = "production";
      process.env.ADMIN_EMAIL = "admin@falah.dev";
      process.env.ADMIN_PASSWORD = "SuperSecurePassword2026!";

      assert.equal(
        validateAdminCredentials("admin@falah.dev", "SuperSecurePassword2026!"),
        true
      );
      assert.equal(
        validateAdminCredentials("ADMIN@FALAH.DEV", "SuperSecurePassword2026!"),
        true,
        "Email should be case-insensitive"
      );
      assert.equal(
        validateAdminCredentials("admin@falah.dev", "WrongPassword!"),
        false
      );
      assert.equal(
        validateAdminCredentials("hacker@evil.com", "SuperSecurePassword2026!"),
        false
      );
    });
  });

  describe("resolveJwtSecret enforcement", () => {
    it("throws fatal error in production if ADMIN_JWT_SECRET is missing", () => {
      process.env.NODE_ENV = "production";
      delete process.env.ADMIN_JWT_SECRET;

      assert.throws(
        () => resolveJwtSecret(),
        /ADMIN_JWT_SECRET must be defined with at least 32 characters in production environment/
      );
    });

    it("throws fatal error in production if ADMIN_JWT_SECRET is shorter than 32 characters", () => {
      process.env.NODE_ENV = "production";
      process.env.ADMIN_JWT_SECRET = "short_secret_under_32_chars";

      assert.throws(
        () => resolveJwtSecret(),
        /ADMIN_JWT_SECRET must be defined with at least 32 characters in production environment/
      );
    });

    it("successfully returns secret key when length is at least 32 characters", () => {
      const validSecret = "a_very_long_production_ready_jwt_secret_with_more_than_32_chars";
      process.env.ADMIN_JWT_SECRET = validSecret;

      const secretKey = resolveJwtSecret();
      assert.ok(secretKey instanceof Uint8Array);
      assert.equal(secretKey.length, validSecret.length);
    });
  });

  describe("Rate Limiter sliding window protection", () => {
    it("allows requests up to max limit and blocks excess requests", () => {
      const testKey = `test-ip-${Date.now()}`;
      const options = { windowMs: 5000, maxRequests: 3 };

      const r1 = rateLimiter.check(testKey, options);
      assert.equal(r1.allowed, true);
      assert.equal(r1.remaining, 2);

      const r2 = rateLimiter.check(testKey, options);
      assert.equal(r2.allowed, true);
      assert.equal(r2.remaining, 1);

      const r3 = rateLimiter.check(testKey, options);
      assert.equal(r3.allowed, true);
      assert.equal(r3.remaining, 0);

      // 4th request exceeds max
      const r4 = rateLimiter.check(testKey, options);
      assert.equal(r4.allowed, false);
      assert.equal(r4.remaining, 0);
      assert.ok(r4.retryAfterSeconds > 0);

      // Reset works
      rateLimiter.reset(testKey);
      const rAfterReset = rateLimiter.check(testKey, options);
      assert.equal(rAfterReset.allowed, true);
    });
  });

  describe("Contact Form security & input sanitization", () => {
    it("accepts valid contact submissions", () => {
      const validData = {
        name: "Jane Doe",
        email: "jane@example.com",
        subject: "Project Inquiry",
        message: "Hello Falah, I would like to discuss a project collaboration.",
      };
      const result = contactFormSchema.safeParse(validData);
      assert.equal(result.success, true);
    });

    it("rejects malicious emails with CRLF header injection attempts", () => {
      const maliciousData = {
        name: "Attacker",
        email: "user@example.com\r\nBcc: victim@example.com",
        message: "Spam message payload",
      };
      const result = contactFormSchema.safeParse(maliciousData);
      assert.equal(result.success, false);
    });

    it("rejects emails with script tags", () => {
      const scriptEmail = {
        name: "Attacker",
        email: "<script>alert(1)</script>@evil.com",
        message: "Injected script payload",
      };
      const result = contactFormSchema.safeParse(scriptEmail);
      assert.equal(result.success, false);
    });
  });
});
