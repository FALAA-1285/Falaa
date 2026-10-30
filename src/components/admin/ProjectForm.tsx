"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Project } from "@/types/portfolio";
import { projectSchema, ProjectFormData, CATEGORIES } from "@/lib/schemas/project";
import { createProjectAction, updateProjectAction } from "@/actions/admin/projects";
import ImageUploader from "./ImageUploader";
import Field from "./Field";

interface ProjectFormProps {
  initialData?: Project;
  isEdit?: boolean;
}

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProjectForm({ initialData, isEdit = false }: ProjectFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState("");
  const [slugTouched, setSlugTouched] = useState(isEdit);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      id: initialData?.id || "",
      title: initialData?.title || "",
      category: (initialData?.category as ProjectFormData["category"]) || CATEGORIES[0],
      tagline: initialData?.tagline || "",
      description: initialData?.description || "",
      image: initialData?.image || "",
      tags: initialData?.tags || [],
      features: initialData?.features?.length ? initialData.features : [""],
      githubUrl: initialData?.githubUrl || "",
      liveUrl: initialData?.liveUrl || "",
      metrics: initialData?.metrics || "",
    },
  });

  const image = useWatch({ control, name: "image" });
  const tags = useWatch({ control, name: "tags" }) || [];
  const features = useWatch({ control, name: "features" }) || [];

  const titleField = register("title");

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed], { shouldValidate: true });
    }
    setTagInput("");
  };

  const setFeatures = (next: string[]) => setValue("features", next, { shouldValidate: true });

  const onSubmit = async (data: ProjectFormData) => {
    setServerError(null);
    const features = data.features.map((f) => f.trim()).filter(Boolean);
    if (features.length === 0) {
      setServerError("Isi minimal satu fitur utama.");
      return;
    }
    const payload = { ...data, features };

    try {
      const result =
        isEdit && initialData
          ? await updateProjectAction(initialData.id, payload)
          : await createProjectAction(payload);

      if (result.success) {
        router.push("/admin/projects");
        router.refresh();
      } else {
        setServerError(result.error || "Project gagal disimpan.");
      }
    } catch {
      setServerError("Project gagal disimpan. Periksa koneksi lalu coba lagi.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && <div className="adm-notice adm-notice-error mb-4">{serverError}</div>}

      <div className="adm-panel">
        <section className="adm-section space-y-4">
          <h2 className="adm-h2">Dasar</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Judul" htmlFor="title" error={errors.title?.message}>
              <input
                id="title"
                className="adm-input"
                aria-invalid={!!errors.title}
                {...titleField}
                onChange={(e) => {
                  titleField.onChange(e);
                  if (!slugTouched) setValue("id", toSlug(e.target.value), { shouldValidate: true });
                }}
              />
            </Field>
            <Field
              label="Slug"
              htmlFor="id"
              error={errors.id?.message}
              hint={isEdit ? "Slug tidak bisa diubah setelah project dibuat." : "Dipakai sebagai ID project. Dibuat otomatis dari judul."}
            >
              <input
                id="id"
                className="adm-input"
                readOnly={isEdit}
                aria-invalid={!!errors.id}
                {...register("id", { onChange: () => setSlugTouched(true) })}
              />
            </Field>
            <Field label="Kategori" htmlFor="category" error={errors.category?.message}>
              <select id="category" className="adm-input" {...register("category")}>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tagline" htmlFor="tagline" error={errors.tagline?.message} hint="Satu kalimat di bawah judul.">
              <input id="tagline" className="adm-input" aria-invalid={!!errors.tagline} {...register("tagline")} />
            </Field>
          </div>
          <Field label="Deskripsi" htmlFor="description" error={errors.description?.message}>
            <textarea
              id="description"
              rows={5}
              className="adm-input"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
          </Field>
        </section>

        <section className="adm-section space-y-4">
          <h2 className="adm-h2">Gambar sampul</h2>
          <ImageUploader
            value={image}
            onChange={(url) => setValue("image", url, { shouldValidate: true })}
            error={errors.image?.message}
          />
        </section>

        <section className="adm-section space-y-4">
          <h2 className="adm-h2">Teknologi dan fitur</h2>

          <Field
            label="Teknologi"
            htmlFor="tag-input"
            error={errors.tags?.message}
            hint="Tekan Enter untuk menambahkan."
          >
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, idx) => (
                  <span key={tag} className="adm-chip">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setValue("tags", tags.filter((_, i) => i !== idx), { shouldValidate: true })}
                      className="cursor-pointer"
                      style={{ color: "var(--faint)" }}
                      aria-label={`Hapus ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              id="tag-input"
              className="adm-input md:max-w-sm"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Tambah teknologi"
            />
          </Field>

          <Field label="Fitur utama" error={errors.features?.message ?? errors.features?.[0]?.message}>
            <div className="space-y-2">
              {features.map((feat, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    className="adm-input"
                    value={feat}
                    aria-label={`Fitur ${idx + 1}`}
                    onChange={(e) => setFeatures(features.map((f, i) => (i === idx ? e.target.value : f)))}
                  />
                  <button
                    type="button"
                    className="adm-icon-btn adm-icon-btn-danger shrink-0 self-center"
                    onClick={() => setFeatures(features.filter((_, i) => i !== idx))}
                    disabled={features.length <= 1}
                    aria-label={`Hapus fitur ${idx + 1}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" className="adm-btn self-start" onClick={() => setFeatures([...features, ""])}>
              Tambah fitur
            </button>
          </Field>
        </section>

        <section className="adm-section space-y-4">
          <h2 className="adm-h2">Tautan</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Repositori GitHub" htmlFor="githubUrl" optional error={errors.githubUrl?.message}>
              <input
                id="githubUrl"
                className="adm-input"
                placeholder="https://github.com/FALAA-1285/…"
                aria-invalid={!!errors.githubUrl}
                {...register("githubUrl")}
              />
            </Field>
            <Field label="Demo" htmlFor="liveUrl" optional error={errors.liveUrl?.message}>
              <input
                id="liveUrl"
                className="adm-input"
                placeholder="https://"
                aria-invalid={!!errors.liveUrl}
                {...register("liveUrl")}
              />
            </Field>
          </div>
          <Field
            label="Hasil yang terukur"
            htmlFor="metrics"
            optional
            error={errors.metrics?.message}
            hint="Contoh: waktu registrasi turun 40%."
          >
            <input id="metrics" className="adm-input" {...register("metrics")} />
          </Field>
        </section>
      </div>

      <div className="flex items-center justify-end gap-2 mt-5">
        <Link href="/admin/projects" className="adm-btn adm-btn-quiet">
          Batal
        </Link>
        <button type="submit" disabled={isSubmitting} className="adm-btn adm-btn-primary">
          {isSubmitting ? "Menyimpan…" : isEdit ? "Simpan perubahan" : "Simpan project"}
        </button>
      </div>
    </form>
  );
}
