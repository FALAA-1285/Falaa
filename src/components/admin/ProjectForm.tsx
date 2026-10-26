"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Save,
  ArrowLeft,
  Plus,
  Trash2,
  X,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Project } from "@/types/portfolio";
import {
  projectSchema,
  ProjectFormData,
  CATEGORIES,
} from "@/lib/schemas/project";
import {
  createProjectAction,
  updateProjectAction,
} from "@/actions/admin/projects";
import ImageUploader from "./ImageUploader";

interface ProjectFormProps {
  initialData?: Project;
  isEdit?: boolean;
}

export default function ProjectForm({
  initialData,
  isEdit = false,
}: ProjectFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");

  const defaultValues: ProjectFormData = {
    id: initialData?.id || "",
    title: initialData?.title || "",
    category: (initialData?.category as ProjectFormData["category"]) || "Web & Fullstack",
    tagline: initialData?.tagline || "",
    description: initialData?.description || "",
    image: initialData?.image || "",
    tags: initialData?.tags || ["Next.js", "TypeScript"],
    features: initialData?.features || [
      "Fitur unggulan 1",
      "Fitur unggulan 2",
    ],
    githubUrl: initialData?.githubUrl || "https://github.com/FALAA-1285",
    liveUrl: initialData?.liveUrl || "",
    metrics: initialData?.metrics || "",
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues,
  });

  const currentImage = watch("image");
  const currentTags = watch("tags") || [];
  const currentFeatures = watch("features") || [];

  // Auto-slug generation from title in create mode
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const titleVal = e.target.value;
    setValue("title", titleVal, { shouldValidate: true });
    if (!isEdit && (!watch("id") || watch("id") === "")) {
      const generatedSlug = titleVal
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("id", generatedSlug, { shouldValidate: true });
    }
  };

  // Tag Management
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !currentTags.includes(trimmed)) {
      setValue("tags", [...currentTags, trimmed], { shouldValidate: true });
      setTagInput("");
    }
  };

  const removeTag = (indexToRemove: number) => {
    const updated = currentTags.filter((_, idx) => idx !== indexToRemove);
    setValue("tags", updated, { shouldValidate: true });
  };

  // Feature Points Management
  const addFeature = () => {
    setValue("features", [...currentFeatures, ""], { shouldValidate: true });
  };

  const updateFeature = (index: number, value: string) => {
    const updated = [...currentFeatures];
    updated[index] = value;
    setValue("features", updated, { shouldValidate: true });
  };

  const removeFeature = (index: number) => {
    if (currentFeatures.length <= 1) return;
    const updated = currentFeatures.filter((_, idx) => idx !== index);
    setValue("features", updated, { shouldValidate: true });
  };

  // Submit Handler
  const onSubmit = async (data: ProjectFormData) => {
    setServerError(null);
    setSuccessMsg(null);

    try {
      if (isEdit && initialData) {
        const result = await updateProjectAction(initialData.id, data);
        if (result.success) {
          setSuccessMsg("Project berhasil diperbarui!");
          setTimeout(() => {
            router.push("/admin/projects");
            router.refresh();
          }, 800);
        } else {
          setServerError(result.error || "Gagal memperbarui project.");
        }
      } else {
        const result = await createProjectAction(data);
        if (result.success) {
          setSuccessMsg("Project baru berhasil ditambahkan!");
          setTimeout(() => {
            router.push("/admin/projects");
            router.refresh();
          }, 800);
        } else {
          setServerError(result.error || "Gagal membuat project.");
        }
      }
    } catch {
      setServerError("Terjadi kesalahan tak terduga saat memproses data.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl">
      {/* Notifications */}
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {serverError}
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Basic Info Section */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
          Informasi Utama
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Judul Project <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("title")}
              onChange={handleTitleChange}
              placeholder="Contoh: Academic Portal Polinema"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            {errors.title && (
              <p className="text-xs text-red-600 mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* ID / Slug */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Slug / ID Unik <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("id")}
              disabled={isEdit}
              placeholder="academic-portal"
              className={`w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition ${
                isEdit ? "bg-neutral-100 text-neutral-500 cursor-not-allowed" : ""
              }`}
            />
            {errors.id && (
              <p className="text-xs text-red-600 mt-1">{errors.id.message}</p>
            )}
            {isEdit && (
              <p className="text-[11px] text-neutral-400 mt-1">
                ID slug tidak dapat diubah pada mode edit untuk menjaga integritas data.
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              {...register("category")}
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-black transition"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="text-xs text-red-600 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Tagline */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              Tagline Ringkas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register("tagline")}
              placeholder="Comprehensive Academic Management System"
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            {errors.tagline && (
              <p className="text-xs text-red-600 mt-1">
                {errors.tagline.message}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Deskripsi Lengkap <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            {...register("description")}
            placeholder="Jelaskan gambaran umum, latar belakang, dan arsitektur project..."
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
          />
          {errors.description && (
            <p className="text-xs text-red-600 mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      {/* Media & Image Upload Section */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
          Media Gambar
        </h2>
        <ImageUploader
          value={currentImage}
          onChange={(url) => setValue("image", url, { shouldValidate: true })}
          error={errors.image?.message}
        />
      </div>

      {/* Tech Tags & Key Features */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
          Teknologi & Fitur Utama
        </h2>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Teknologi (Tags) <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Ketik teknologi lalu tekan Tambah (contoh: Next.js, Laravel, Python)"
              className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-black transition"
            >
              Tambah Tag
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {currentTags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs bg-neutral-100 border border-neutral-200 text-neutral-800 px-2.5 py-1 rounded-md"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => removeTag(idx)}
                  className="text-neutral-400 hover:text-red-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {errors.tags && (
            <p className="text-xs text-red-600 mt-1">{errors.tags.message}</p>
          )}
        </div>

        {/* Features Points */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider">
              Poin-Poin Fitur Utama <span className="text-red-500">*</span>
            </label>
            <button
              type="button"
              onClick={addFeature}
              className="inline-flex items-center gap-1 text-xs text-neutral-700 hover:text-black font-medium transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Poin</span>
            </button>
          </div>

          <div className="space-y-2">
            {currentFeatures.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => updateFeature(idx, e.target.value)}
                  placeholder={`Fitur poin #${idx + 1}`}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
                />
                <button
                  type="button"
                  onClick={() => removeFeature(idx)}
                  disabled={currentFeatures.length <= 1}
                  className="p-2 text-neutral-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed transition"
                  title="Hapus poin"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {errors.features && (
            <p className="text-xs text-red-600 mt-1">
              {errors.features.message}
            </p>
          )}
        </div>
      </div>

      {/* External Links & Metrics */}
      <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm space-y-6">
        <h2 className="text-base font-semibold text-neutral-900 border-b border-neutral-100 pb-3">
          Tautan & Metrik
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              URL Repository GitHub
            </label>
            <input
              type="text"
              {...register("githubUrl")}
              placeholder="https://github.com/FALAA-1285/..."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            {errors.githubUrl && (
              <p className="text-xs text-red-600 mt-1">
                {errors.githubUrl.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
              URL Live Demo (Opsional)
            </label>
            <input
              type="text"
              {...register("liveUrl")}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
            />
            {errors.liveUrl && (
              <p className="text-xs text-red-600 mt-1">
                {errors.liveUrl.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
            Metrik / Pencapaian Kinerja (Opsional)
          </label>
          <input
            type="text"
            {...register("metrics")}
            placeholder="Contoh: Reduced course registration processing time by 40%"
            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black transition"
          />
          {errors.metrics && (
            <p className="text-xs text-red-600 mt-1">
              {errors.metrics.message}
            </p>
          )}
        </div>
      </div>

      {/* Form Submission Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar</span>
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white px-6 py-2.5 rounded-md text-sm font-medium transition shadow-sm disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? "Simpan Perubahan" : "Publikasikan Project"}</span>
        </button>
      </div>
    </form>
  );
}
