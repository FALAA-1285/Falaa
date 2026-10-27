"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2, Link as LinkIcon, AlertTriangle } from "lucide-react";
import { uploadImageAction } from "@/actions/admin/upload";
import { isSafeImageUrl, sanitizeImageUrl } from "@/lib/security";

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

export default function ImageUploader({
  value,
  onChange,
  error,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isManualUrlMode, setIsManualUrlMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const result = await uploadImageAction(formData);
      if (result.success && result.url) {
        onChange(result.url);
      } else {
        setUploadError(result.error || "Gagal mengunggah gambar.");
      }
    } catch {
      setUploadError("Terjadi kesalahan jaringan saat mengunggah.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
    setUploadError(null);
  };

  const isValueSafe = !value || isSafeImageUrl(value);
  const safePreviewSrc = isValueSafe && value ? sanitizeImageUrl(value) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
          Gambar / Media Project
        </label>
        <button
          type="button"
          onClick={() => setIsManualUrlMode(!isManualUrlMode)}
          className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 transition-colors underline cursor-pointer"
        >
          <LinkIcon className="w-3 h-3" />
          <span>{isManualUrlMode ? "Gunakan Upload File" : "Input URL Manual"}</span>
        </button>
      </div>

      {isManualUrlMode ? (
        <div className="space-y-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Contoh: /projects/project-1.svg atau https://images..."
            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition ${
              !isValueSafe
                ? "border-red-400 bg-red-50/50"
                : "border-neutral-300"
            }`}
          />
          {!isValueSafe && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Format URL gambar tidak aman atau tidak diizinkan. Skema berbahaya seperti javascript: ditolak.
              </span>
            </p>
          )}
          <p className="text-[11px] text-neutral-500">
            Masukkan path lokal internal (`/projects/nama.svg`, `/uploads/...`) atau URL gambar aman (`https://...`).
          </p>

          {safePreviewSrc && (
            <div className="relative border border-neutral-200 rounded-lg p-2 bg-neutral-50 flex items-center gap-4 mt-2">
              <div className="relative w-20 h-16 rounded bg-white border border-neutral-200 overflow-hidden shrink-0">
                <Image
                  src={safePreviewSrc}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized={safePreviewSrc.endsWith(".svg")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-800 truncate">
                  {value}
                </p>
                <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                  URL gambar valid
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-red-600 transition"
                title="Hapus gambar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>
          {value && isValueSafe ? (
            <div className="relative border border-neutral-200 rounded-lg p-2 bg-neutral-50 flex items-center gap-4">
              <div className="relative w-24 h-20 rounded bg-white border border-neutral-200 overflow-hidden shrink-0">
                <Image
                  src={safePreviewSrc || "/projects/project-1.svg"}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized={value.endsWith(".svg")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-neutral-800 truncate">
                  {value}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Gambar aktif berhasil disimpan
                </p>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-red-600 transition"
                title="Hapus gambar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                isUploading
                  ? "border-neutral-300 bg-neutral-50 opacity-70"
                  : "border-neutral-300 hover:border-black bg-white hover:bg-neutral-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-neutral-600" />
                  <span className="text-xs text-neutral-600 font-medium">
                    Sedang mengunggah gambar ke server...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-900">
                      Klik untuk upload gambar
                    </span>
                    <span className="text-xs text-neutral-500"> atau seret file ke sini</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    Mendukung PNG, JPEG, WEBP, GIF (Maks. 5MB)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {(uploadError || error) && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
          <span>{uploadError || error}</span>
        </p>
      )}
    </div>
  );
}
