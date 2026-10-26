"use server";

import fs from "fs/promises";
import path from "path";
import { getAdminSession } from "@/lib/auth";

export interface UploadActionResult {
  success: boolean;
  url?: string;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];
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

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: "Format file tidak didukung. Gunakan PNG, JPEG, WEBP, atau SVG.",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: "Ukuran file terlalu besar. Maksimum diperbolehkan adalah 5MB.",
    };
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename & create unique timestamped name
    const ext = path.extname(file.name) || ".png";
    const baseName = path
      .basename(file.name, ext)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 30);
    const uniqueFileName = `${baseName}-${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error("Gagal mengupload gambar:", error);
    return {
      success: false,
      error: error?.message || "Terjadi kesalahan saat menyimpan gambar.",
    };
  }
}
