import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { uploadToStorage } from "@/lib/storage";

const originalEnv = { ...process.env };
const originalFetch = globalThis.fetch;
const file = { buffer: Buffer.from("x"), contentType: "image/png", filename: "a.png", folder: "uploads" };

describe("uploadToStorage on serverless hosts", () => {
  afterEach(() => {
    process.env = { ...originalEnv };
    globalThis.fetch = originalFetch;
  });

  it("refuses the read-only local fallback on Vercel and explains why", async () => {
    process.env.VERCEL = "1";
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await uploadToStorage(file);
    assert.equal(res.success, false);
    assert.match(res.error, /belum dikonfigurasi/);
  });

  it("reports a missing bucket instead of silently writing locally", async () => {
    process.env.SUPABASE_URL = "https://ref.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    globalThis.fetch = async () => new Response("Bucket not found", { status: 404 });
    const res = await uploadToStorage(file);
    assert.equal(res.success, false);
    assert.match(res.error, /tidak ditemukan/);
  });

  it("returns the public Supabase URL on success", async () => {
    process.env.SUPABASE_URL = "https://ref.supabase.co/";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    process.env.SUPABASE_STORAGE_BUCKET = "portfolio-assets";
    let calledUrl = "";
    let headers = {};
    globalThis.fetch = async (url, init) => {
      calledUrl = String(url);
      headers = init.headers;
      return new Response("{}", { status: 200 });
    };
    const res = await uploadToStorage(file);
    assert.equal(res.success, true);
    assert.equal(calledUrl, "https://ref.supabase.co/storage/v1/object/portfolio-assets/uploads/a.png");
    assert.equal(headers.apikey, "test-key", "sb_secret_ keys must be sent in the apikey header");
    assert.equal(res.url, "https://ref.supabase.co/storage/v1/object/public/portfolio-assets/uploads/a.png");
  });
});
