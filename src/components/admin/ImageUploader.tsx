"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { uploadImageAction } from "@/actions/admin/upload";
import { isSafeImageUrl, sanitizeImageUrl } from "@/lib/security";

const MAX_FILE_SIZE = 4 * 1024 * 1024;

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

export default function ImageUploader({ value, onChange, error }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("Ukuran file terlalu besar. Maksimum diperbolehkan adalah 4MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setUploadError(result.error || "Gambar gagal diunggah.");
      }
    } catch {
      setUploadError("Gambar gagal diunggah. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const isValueSafe = !value || isSafeImageUrl(value);
  const preview = value && isValueSafe ? sanitizeImageUrl(value) : null;
  const message = uploadError || error || (!isValueSafe ? "Gunakan URL http(s) atau path seperti /projects/nama.webp." : null);

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div
        className="relative w-full sm:w-48 aspect-16/10 shrink-0 overflow-hidden rounded flex items-center justify-center"
        style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Pratinjau gambar sampul"
            fill
            sizes="192px"
            className="object-cover"
            unoptimized={preview.endsWith(".svg")}
          />
        ) : (
          <span className="adm-faint">Belum ada gambar</span>
        )}
      </div>

      <div className="flex-1 space-y-3 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={isUploading}
            className="sr-only"
            id="image-file"
          />
          <label htmlFor="image-file" className="adm-btn" aria-disabled={isUploading}>
            {isUploading ? "Mengunggah…" : preview ? "Ganti gambar" : "Unggah gambar"}
          </label>
          {preview && (
            <button type="button" className="adm-btn adm-btn-quiet" onClick={() => onChange("")}>
              Hapus
            </button>
          )}
          <span className="adm-faint">PNG, JPEG, WEBP, atau GIF. Maksimal 4 MB.</span>
        </div>

        <div className="adm-field">
          <label htmlFor="image-url" className="adm-label">
            Atau tempel URL gambar
          </label>
          <input
            id="image-url"
            className="adm-input"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/projects/nama.webp atau https://…"
            aria-invalid={!!message}
          />
          {message && <p className="adm-error">{message}</p>}
        </div>
      </div>
    </div>
  );
}
