"use server";

import fs from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/auth";

export interface UploadActionResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Strict mapping of accepted image MIME types to their permitted file extensions.
 * Notice: SVG (image/svg+xml) is intentionally disallowed to prevent Stored Cross-Site Scripting (XSS).
 */
const MIME_EXTENSION_MAP: Record<string, string[]> = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
};

const ALLOWED_MIME_TYPES = Object.keys(MIME_EXTENSION_MAP);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function uploadImageAction(
  formData: FormData
): Promise<UploadActionResult> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  const file = formData.get("file") as File | null;
  if (!file || typeof file === "string") {
    return { success: false, error: "File gambar tidak ditemukan." };
  }

  // 1. Validate MIME Type strictly
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Format file tidak didukung. Demi keamanan, hanya PNG, JPEG, WEBP, dan GIF yang diizinkan (SVG tidak diperbolehkan).",
    };
  }

  // 2. Validate Size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "Ukuran file terlalu besar. Maksimum diperbolehkan adalah 5MB.",
    };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Strict extension matching against MIME whitelist
    const allowedExts = MIME_EXTENSION_MAP[file.type];
    const clientExt = path.extname(file.name).toLowerCase();
    const safeExt = allowedExts && allowedExts.includes(clientExt)
      ? clientExt
      : allowedExts[0];

    // 4. Sanitize base filename and prevent path traversal / shell injection
    const rawBase = path.basename(file.name, path.extname(file.name));
    const sanitizedBase = rawBase
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30) || "upload";

    const uniqueFileName = `${sanitizedBase}-${Date.now()}${safeExt}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return { success: true, url: publicUrl };
  } catch (error: unknown) {
    console.error("Gagal mengupload gambar:", error);
    return {
      success: false,
      error: "Terjadi kesalahan saat memproses dan menyimpan berkas gambar.",
    };
  }
}
