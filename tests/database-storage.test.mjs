import test, { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { uploadToStorage } from "@/lib/storage";

describe("PHASE 2 - DATABASE & STORAGE: Architecture & Migration Verification", () => {
  describe("uploadToStorage abstraction", () => {
    it("successfully uploads a file buffer to storage and returns public URL", async () => {
      const testBuffer = Buffer.from("fake-image-binary-data");
      const filename = `test-img-${Date.now()}.png`;

      const result = await uploadToStorage({
        buffer: testBuffer,
        contentType: "image/png",
        filename,
        folder: "uploads",
      });

      assert.equal(result.success, true);
      assert.ok(result.url);
      assert.ok(result.url.includes(filename));

      // Clean up test file if stored locally
      const localFilePath = path.join(process.cwd(), "public", "uploads", filename);
      if (fs.existsSync(localFilePath)) {
        fs.unlinkSync(localFilePath);
      }
    });
  });

  describe("Database schema migration files existence & order", () => {
    it("contains all versioned migration files in migrations/", () => {
      const migrationsDir = path.resolve(process.cwd(), "migrations");
      assert.ok(fs.existsSync(migrationsDir));

      const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql"));
      assert.ok(files.includes("001_create_schema_migrations.sql"));
      assert.ok(files.includes("002_initial_schema.sql"));
      assert.ok(files.includes("003_add_secondary_indexes.sql"));
      assert.ok(files.includes("004_enable_row_level_security.sql"));
    });
  });

  describe("Live PostgreSQL Indexes & RLS Verification", () => {
    it("verifies live secondary indexes and RLS in PostgreSQL", { skip: !process.env.TEST_DATABASE_URL && "TEST_DATABASE_URL not set" }, async () => {
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString: process.env.TEST_DATABASE_URL,
        connectionTimeoutMillis: 10000,
      });

      try {
        // 1. Verify schema_migrations contains our migrations
        const migRes = await pool.query(
          "SELECT name FROM public.schema_migrations ORDER BY id ASC"
        );
        const applied = migRes.rows.map((r) => r.name);
        assert.ok(applied.includes("001_create_schema_migrations.sql"));
        assert.ok(applied.includes("002_initial_schema.sql"));
        assert.ok(applied.includes("003_add_secondary_indexes.sql"));
        assert.ok(applied.includes("004_enable_row_level_security.sql"));

        // 2. Verify secondary indexes in pg_indexes
        const idxRes = await pool.query(`
          SELECT indexname 
          FROM pg_indexes 
          WHERE schemaname = 'public'
        `);
        const indexNames = idxRes.rows.map((r) => r.indexname);
        assert.ok(indexNames.includes("idx_projects_order"), "idx_projects_order must exist");
        assert.ok(indexNames.includes("idx_experiences_order"), "idx_experiences_order must exist");
        assert.ok(indexNames.includes("idx_skills_order"), "idx_skills_order must exist");
        assert.ok(indexNames.includes("idx_skills_category"), "idx_skills_category must exist");
        assert.ok(indexNames.includes("idx_messages_created"), "idx_messages_created must exist");
        assert.ok(indexNames.includes("idx_messages_unread"), "idx_messages_unread must exist");

        // 3. Verify Row Level Security (RLS) enabled on all 5 tables
        const rlsRes = await pool.query(`
          SELECT tablename, rowsecurity 
          FROM pg_tables 
          WHERE schemaname = 'public' 
            AND tablename IN ('profile_info', 'projects', 'experiences', 'skills', 'messages')
        `);
        for (const row of rlsRes.rows) {
          assert.equal(
            row.rowsecurity,
            true,
            `Table ${row.tablename} must have rowsecurity = true`
          );
        }
      } finally {
        await pool.end();
      }
    });
  });
});
