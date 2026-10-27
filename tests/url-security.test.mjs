import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  isSafeUrl,
  isSafeImageUrl,
  sanitizeUrl,
  sanitizeImageUrl,
  isSafeEmail,
  createSafeMailtoUrl,
  stripControlAndWhitespace,
} from "../src/lib/security.ts";

import { projectSchema } from "../src/lib/schemas/project.ts";
import { profileSchema } from "../src/lib/schemas/profile.ts";

describe("PHASE 1 - SECURITY FIXES: Stored XSS Prevention on URL Fields", () => {
  describe("stripControlAndWhitespace helper", () => {
    test("strips control characters and whitespace", () => {
      assert.equal(stripControlAndWhitespace("  hello\x00world\x1f  "), "helloworld");
    });
  });

  describe("isSafeUrl protocol and scheme verification", () => {
    const maliciousPayloads = [
      "javascript:alert(1)",
      "javascript:alert('XSS')",
      "javascript:void(0)",
      "JAVASCRIPT:alert(document.cookie)",
      "Javascript:alert(window.origin)",
      " javascript:alert(1)",
      "javascript:alert(1) ",
      "   javascript:alert(1)   ",
      "\x00javascript:alert(1)",
      "\x01javascript:alert(1)",
      "\x1fjavascript:alert(1)",
      "javascript\x00:alert(1)",
      "javascript :alert(1)",
      "javascript\t:alert(1)",
      "javascript\n:alert(1)",
      "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      "data:text/html,<script>alert(1)</script>",
      "data:image/svg+xml;utf8,<svg onload=alert(1)>",
      "vbscript:msgbox(1)",
      "VBSCRIPT:alert(1)",
      "file:///etc/passwd",
      "file:///C:/Windows/System32/calc.exe",
      "blob:http://localhost:3000/b1c45620-302a-4318-bfae-f6324d451296",
      "//evil.com/payload.js",
      "/\\evil.com",
      "\\\\evil.com",
      "http:///missing-host",
      "https://",
      "not-a-valid-url",
      "",
      "   ",
    ];

    for (const payload of maliciousPayloads) {
      test(`must reject malicious or invalid URL payload: ${JSON.stringify(payload)}`, () => {
        const result = isSafeUrl(payload);
        assert.equal(result, false, `Expected payload "${payload}" to be rejected by isSafeUrl`);
      });
    }

    const legitimateUrls = [
      "https://github.com/FALAA-1285",
      "https://github.com/FALAA-1285/falaa-portfolio",
      "https://www.linkedin.com/in/muhammad-falah-nur-hidayat-67994931a/",
      "https://my-domain.vercel.app",
      "https://portfolio.com/path?query=1&item=2#section",
      "http://localhost:3000",
      "http://127.0.0.1:8080/demo",
    ];

    for (const validUrl of legitimateUrls) {
      test(`must accept legitimate URL: ${validUrl}`, () => {
        const result = isSafeUrl(validUrl);
        assert.equal(result, true, `Expected legitimate URL "${validUrl}" to be accepted`);
      });
    }

    test("handles non-string inputs safely without throwing", () => {
      assert.equal(isSafeUrl(null), false);
      assert.equal(isSafeUrl(undefined), false);
      assert.equal(isSafeUrl(12345), false);
      assert.equal(isSafeUrl({}), false);
      assert.equal(isSafeUrl([]), false);
    });
  });

  describe("sanitizeUrl sanitization logic", () => {
    test("returns cleaned URL when safe", () => {
      assert.equal(sanitizeUrl("  https://github.com/test  "), "https://github.com/test");
    });

    test("returns fallback when unsafe", () => {
      assert.equal(sanitizeUrl("javascript:alert(1)", "https://fallback.com"), "https://fallback.com");
      assert.equal(sanitizeUrl(null, "https://fallback.com"), "https://fallback.com");
    });
  });

  describe("isSafeImageUrl image source verification", () => {
    const maliciousImageUrls = [
      "javascript:alert(1)",
      "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
      "data:image/svg+xml;utf8,<svg onload=alert(1)>",
      "vbscript:alert(1)",
      "/uploads/../../etc/passwd",
      "/projects/../../../secret.txt",
      "//evil.com/exploit.png",
      "/\\evil.com/test.png",
      "/uploads/shell.php",
      "/uploads/exploit.html",
      "/uploads/script.js",
      "file:///etc/shadow",
      "",
    ];

    for (const payload of maliciousImageUrls) {
      test(`must reject dangerous image source: ${JSON.stringify(payload)}`, () => {
        const result = isSafeImageUrl(payload);
        assert.equal(result, false, `Expected image payload "${payload}" to be rejected`);
      });
    }

    const safeImageSources = [
      "/projects/project-1.svg",
      "/projects/academic-system.png",
      "/uploads/portfolio-cover-1718000000000.png",
      "/uploads/avatar-2026.webp",
      "/foto.jpg",
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c",
      "https://cdn.example.com/assets/banner.png",
      "http://localhost:3000/demo.png",
    ];

    for (const safeSrc of safeImageSources) {
      test(`must accept safe image source: ${safeSrc}`, () => {
        const result = isSafeImageUrl(safeSrc);
        assert.equal(result, true, `Expected safe image source "${safeSrc}" to be accepted`);
      });
    }
  });

  describe("sanitizeImageUrl sanitization logic", () => {
    test("returns cleaned image URL when safe", () => {
      assert.equal(sanitizeImageUrl("  /projects/project-1.svg  "), "/projects/project-1.svg");
    });

    test("returns default fallback when image is unsafe", () => {
      assert.equal(sanitizeImageUrl("javascript:alert(1)"), "/projects/project-1.svg");
      assert.equal(sanitizeImageUrl(null), "/projects/project-1.svg");
    });
  });

  describe("isSafeEmail and createSafeMailtoUrl", () => {
    test("validates safe and clean emails", () => {
      assert.equal(isSafeEmail("m.falah1285@gmail.com"), true);
      assert.equal(isSafeEmail("user.name+tag@domain.co.id"), true);
      assert.equal(isSafeEmail("invalid-email"), false);
      assert.equal(isSafeEmail("user@domain.com\r\nBcc:attacker@evil.com"), false);
      assert.equal(isSafeEmail(null), false);
    });

    test("creates properly formatted mailto links for valid emails", () => {
      const url = createSafeMailtoUrl("m.falah1285@gmail.com", "Project Inquiry", "Hello Falah!");
      assert.equal(
        url,
        "mailto:m.falah1285@gmail.com?subject=Project+Inquiry&body=Hello+Falah%21"
      );
    });

    test("rejects CRLF header injection attempts in email", () => {
      const crlfEmail = "test@example.com\r\nBcc:attacker@evil.com";
      const result = createSafeMailtoUrl(crlfEmail);
      assert.equal(result, "#");
    });

    test("rejects XSS and script payloads in email address", () => {
      assert.equal(createSafeMailtoUrl("javascript:alert(1)"), "#");
      assert.equal(createSafeMailtoUrl('<script>alert("xss")</script>@test.com'), "#");
      assert.equal(createSafeMailtoUrl(""), "#");
      assert.equal(createSafeMailtoUrl(null), "#");
      assert.equal(createSafeMailtoUrl(undefined), "#");
    });
  });

  describe("projectSchema Zod Integration Tests", () => {
    const baseValidProject = {
      id: "test-portfolio",
      title: "Portfolio Project",
      category: "Web & Fullstack",
      tagline: "High performance web application",
      description: "A comprehensive showcase web application built with modern standards.",
      image: "/projects/project-1.svg",
      tags: ["Next.js", "TypeScript"],
      features: ["Strict URL security", "Responsive design"],
      githubUrl: "https://github.com/FALAA-1285",
      liveUrl: "https://demo.vercel.app",
      metrics: "Sub-second load times",
    };

    test("successfully validates legitimate project data", () => {
      const parsed = projectSchema.safeParse(baseValidProject);
      assert.equal(parsed.success, true);
    });

    test("allows empty or omitted githubUrl and liveUrl", () => {
      const noUrls = { ...baseValidProject, githubUrl: "", liveUrl: "" };
      const parsed = projectSchema.safeParse(noUrls);
      assert.equal(parsed.success, true);
    });

    test("strictly rejects javascript: in liveUrl", () => {
      const attack = { ...baseValidProject, liveUrl: "javascript:alert(document.domain)" };
      const parsed = projectSchema.safeParse(attack);
      assert.equal(parsed.success, false);
      if (!parsed.success) {
        assert.match(parsed.error.issues[0].message, /URL Demo Live harus valid/);
      }
    });

    test("strictly rejects javascript: in githubUrl", () => {
      const attack = { ...baseValidProject, githubUrl: "javascript:alert('XSS')" };
      const parsed = projectSchema.safeParse(attack);
      assert.equal(parsed.success, false);
      if (!parsed.success) {
        assert.match(parsed.error.issues[0].message, /URL GitHub harus valid/);
      }
    });

    test("strictly rejects data: URI in liveUrl", () => {
      const attack = { ...baseValidProject, liveUrl: "data:text/html,<script>alert(1)</script>" };
      const parsed = projectSchema.safeParse(attack);
      assert.equal(parsed.success, false);
    });

    test("strictly rejects dangerous/malformed image in projectSchema", () => {
      const attack = { ...baseValidProject, image: "javascript:alert(1)" };
      const parsed = projectSchema.safeParse(attack);
      assert.equal(parsed.success, false);
      if (!parsed.success) {
        assert.match(parsed.error.issues[0].message, /Format URL gambar tidak aman/);
      }
    });

    test("strictly rejects path traversal image in projectSchema", () => {
      const attack = { ...baseValidProject, image: "/projects/../../etc/passwd" };
      const parsed = projectSchema.safeParse(attack);
      assert.equal(parsed.success, false);
    });
  });

  describe("profileSchema Zod Integration Tests", () => {
    const baseValidProfile = {
      name: "FALAH",
      handle: "falaa",
      title: "Web Developer",
      institution: "Polinema",
      location: "Malang, Indonesia",
      email: "m.falah1285@gmail.com",
      linkedin: "https://www.linkedin.com/in/falah",
      github: "https://github.com/FALAA-1285",
      quote: "Quality code always matters.",
      about: "Passionate developer focusing on scalable web platforms.",
      aboutSub: "Next.js, TypeScript, PostgreSQL.",
      aboutHeadline: "Hey! I'm FALAH.",
      aboutTags: ["Web Dev", "Fullstack"],
      ctaHeadline: "Let's Connect!",
      ctaSub: "Open for opportunities.",
      ctaButtonText: "Let's Talk",
    };

    test("successfully validates legitimate profile data", () => {
      const parsed = profileSchema.safeParse(baseValidProfile);
      assert.equal(parsed.success, true);
    });

    test("strictly rejects javascript: in linkedin field", () => {
      const attack = { ...baseValidProfile, linkedin: "javascript:alert('LinkedIn XSS')" };
      const parsed = profileSchema.safeParse(attack);
      assert.equal(parsed.success, false);
      if (!parsed.success) {
        assert.match(parsed.error.issues[0].message, /URL LinkedIn harus valid/);
      }
    });

    test("strictly rejects javascript: in github field", () => {
      const attack = { ...baseValidProfile, github: "javascript:alert('GitHub XSS')" };
      const parsed = profileSchema.safeParse(attack);
      assert.equal(parsed.success, false);
      if (!parsed.success) {
        assert.match(parsed.error.issues[0].message, /URL GitHub harus valid/);
      }
    });

    test("strictly rejects invalid email or CRLF injection in profile email", () => {
      const attack = { ...baseValidProfile, email: "admin@domain.com\r\nBcc:victim@evil.com" };
      const parsed = profileSchema.safeParse(attack);
      assert.equal(parsed.success, false);
    });
  });
});
