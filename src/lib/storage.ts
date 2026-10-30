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

/** Human-readable reason for a failed Supabase Storage upload, by HTTP status. */
function describeStorageFailure(status: number, bucketName: string): string {
  if (status === 404) {
    return `Bucket penyimpanan "${bucketName}" tidak ditemukan di Supabase Storage.`;
  }
  if (status === 400 || status === 401 || status === 403) {
    return "Supabase Storage menolak kunci akses. Periksa SUPABASE_SERVICE_ROLE_KEY di server.";
  }
  if (status === 413) {
    return "Ukuran berkas melebihi batas bucket Supabase Storage.";
  }
  return `Supabase Storage gagal menyimpan berkas (status ${status}).`;
}

/**
 * Upload a binary asset to persistent object storage (Supabase Storage).
 * The local public/ directory is used only outside serverless hosts (local development);
 * on Vercel the filesystem is read-only and anything written there would not persist.
 */
export async function uploadToStorage(
  options: StorageUploadOptions
): Promise<StorageUploadResult> {
  const { buffer, contentType, filename, folder = "uploads" } = options;

  const supabaseUrl =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_STORAGE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const bucketName =
    process.env.SUPABASE_STORAGE_BUCKET || "portfolio-assets";

  // 1. Cloud Persistent Storage: Supabase Storage via REST API (Zero external SDK required).
  // When configured, failures are reported instead of silently writing a local file that the
  // deployed site would never be able to serve.
  if (supabaseUrl && serviceKey) {
    try {
      const cleanBaseUrl = supabaseUrl
        .replace(/\/+$/, "")
        .replace(/\/storage\/v1\/?$/, "");
      const objectPath = folder ? `${folder}/${filename}` : filename;
      const uploadEndpoint = `${cleanBaseUrl}/storage/v1/object/${bucketName}/${objectPath}`;

      const res = await fetch(uploadEndpoint, {
        method: "POST",
        headers: {
          // New sb_secret_ keys are not JWTs: the gateway only accepts them via the apikey
          // header (it then derives Authorization). Legacy service_role JWTs work either way.
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": contentType,
          "x-upsert": "true",
        },
        body: new Uint8Array(buffer),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`[STORAGE ERROR] Supabase Storage upload returned status ${res.status}: ${errorText}`);
        return {
          success: false,
          error: describeStorageFailure(res.status, bucketName),
          storageProvider: "supabase",
        };
      }

      return {
        success: true,
        url: `${cleanBaseUrl}/storage/v1/object/public/${bucketName}/${objectPath}`,
        storageProvider: "supabase",
      };
    } catch (err: unknown) {
      console.error("[STORAGE ERROR] Cloud upload error:", err instanceof Error ? err.message : err);
      return {
        success: false,
        error: "Supabase Storage tidak bisa dihubungi. Coba lagi sebentar lagi.",
        storageProvider: "supabase",
      };
    }
  }

  // 2. Serverless hosts have a read-only filesystem: local fallback cannot work there.
  if (process.env.VERCEL) {
    console.error(
      "[STORAGE ERROR] Upload attempted on Vercel without SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY configured."
    );
    return {
      success: false,
      error:
        "Upload gambar belum aktif di server ini: penyimpanan cloud (Supabase Storage) belum dikonfigurasi. Sementara, tempel URL gambar.",
      storageProvider: "local",
    };
  }

  // 3. Local File System Fallback (For local development in Laragon / Node.js)
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
      error:
        process.env.NODE_ENV === "development"
          ? `Sistem penyimpanan lokal gagal: ${errorMsg}`
          : "Sistem penyimpanan gagal menyimpan berkas gambar.",
      storageProvider: "local",
    };
  }
}
