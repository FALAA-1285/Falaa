import fs from "fs/promises";
import path from "path";

export interface StorageUploadOptions {
  buffer: Buffer;
  contentType: string;
  filename: string;
  folder?: string;
}

export interface StorageUploadResult {
  success: boolean;
  url?: string;
  error?: string;
  storageProvider: "supabase" | "local";
}

/**
 * Upload a binary asset to persistent object storage (Supabase Storage),
 * with graceful fallback to local public directory for local development.
 * Designed for serverless environments (Vercel, AWS Lambda) without read-only filesystem crashes.
 */
export async function uploadToStorage(
  options: StorageUploadOptions
): Promise<StorageUploadResult> {
  const { buffer, contentType, filename, folder = "uploads" } = options;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets";

  // 1. Cloud Persistent Storage: Supabase Storage via REST API (Zero external SDK required)
  if (supabaseUrl && serviceKey) {
    try {
      const cleanBaseUrl = supabaseUrl.replace(/\/+$/, "");
      const objectPath = folder ? `${folder}/${filename}` : filename;
      const uploadEndpoint = `${cleanBaseUrl}/storage/v1/object/${bucketName}/${objectPath}`;

      const res = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.warn(
          `[STORAGE ADVISORY] Supabase Storage upload returned status ${res.status}: ${errorText}. Falling back to local storage if available.`
        );
      } else {
        const publicUrl = `${cleanBaseUrl}/storage/v1/object/public/${bucketName}/${objectPath}`;
        return {
          success: true,
          url: publicUrl,
          storageProvider: "supabase",
        };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[STORAGE ERROR] Cloud upload error: ${msg}. Falling back to local.`);
    }
  }

  // 2. Local File System Fallback (For local development in Laragon / Node.js)
  try {
    const uploadDir = path.join(process.cwd(), "public", folder);
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/${folder}/${filename}`;
    return {
      success: true,
      url: publicUrl,
      storageProvider: "local",
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Failed to persist file to local disk.";
    console.error("[STORAGE FATAL] Local storage write failed:", errorMsg);
    return {
      success: false,
      error: "Sistem penyimpanan gagal menyimpan berkas gambar.",
      storageProvider: "local",
    };
  }
}
