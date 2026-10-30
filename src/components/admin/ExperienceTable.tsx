"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { ExperienceItem } from "@/types/portfolio";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "@/actions/admin/experiences";
import { reorderExperiencesAction } from "@/actions/admin/reorder";
import Dialog, { ConfirmDialog } from "./Dialog";
import Field from "./Field";
import PageHead from "./PageHead";

const EXPERIENCE_TYPES = [
  "Academic Degree",
  "Work / Internship",
  "Freelance & Projects",
  "Research & Development",
];

interface FormState {
  period: string;
  role: string;
  organization: string;
  location: string;
  type: string;
  description: string;
  highlights: string;
}

const EMPTY_FORM: FormState = {
  period: "",
  role: "",
  organization: "",
  location: "Malang, Indonesia",
  type: EXPERIENCE_TYPES[0],
  description: "",
  highlights: "",
};

interface ExperienceTableProps {
  initialExperiences: ExperienceItem[];
}

export default function ExperienceTable({ initialExperiences }: ExperienceTableProps) {
  const router = useRouter();
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialExperiences);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const [editing, setEditing] = useState<ExperienceItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ExperienceItem | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const update = (key: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const openForm = (item: ExperienceItem | null) => {
    setEditing(item);
    setForm(
      item
        ? {
            period: item.period,
            role: item.role,
            organization: item.organization,
            location: item.location || "",
            type: item.type,
            description: item.description,
            highlights: (item.highlights || []).join("\n"),
          }
        : EMPTY_FORM
    );
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= experiences.length) return;

    const previous = experiences;
    const updated = [...experiences];
    [updated[index], updated[target]] = [updated[target], updated[index]];
    setExperiences(updated);
    setIsReordering(true);
    setError(null);

    try {
      const res = await reorderExperiencesAction(updated.map((e) => e.id!).filter(Boolean));
      if (!res.success) {
        setExperiences(previous);
        setError(res.error || "Urutan pengalaman gagal disimpan.");
      } else {
        router.refresh();
      }
    } catch {
      setExperiences(previous);
      setError("Urutan pengalaman gagal disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsReordering(false);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      ...form,
      highlights: form.highlights
        .split("\n")
        .map((h) => h.trim())
        .filter(Boolean),
    };

    try {
      const res = editing?.id
        ? await updateExperienceAction(editing.id, payload)
        : await createExperienceAction(payload);

      if (res.success && res.experience) {
        const saved = res.experience;
        setExperiences((prev) =>
          editing?.id ? prev.map((x) => (x.id === editing.id ? saved : x)) : [...prev, saved]
        );
        setIsFormOpen(false);
        router.refresh();
      } else {
        setFormError(res.error || "Pengalaman gagal disimpan.");
      }
    } catch {
      setFormError("Pengalaman gagal disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    const id = deleteTarget?.id;
    if (!id) return;
    startDelete(async () => {
      const res = await deleteExperienceAction(id);
      setDeleteTarget(null);
      if (res.success) {
        setExperiences((prev) => prev.filter((x) => x.id !== id));
        router.refresh();
      } else {
        setError(res.error || "Pengalaman gagal dihapus.");
      }
    });
  };

  // Offer the presets plus every type already used, so existing entries keep their value.
  const typeOptions = Array.from(
    new Set([...EXPERIENCE_TYPES, ...experiences.map((x) => x.type), form.type].filter(Boolean))
  );

  return (
    <>
      <PageHead
        title="Pengalaman"
        lede="Riwayat pendidikan dan pekerjaan, tampil berurutan di situs."
        action={
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => openForm(null)}>
            Tambah pengalaman
          </button>
        }
      />

      {error && <div className="adm-notice adm-notice-error mb-4">{error}</div>}

      <div className="adm-panel">
        {experiences.length === 0 ? (
          <div className="adm-section adm-meta">
            Belum ada riwayat. Tambahkan pendidikan atau pekerjaan pertama kamu.
          </div>
        ) : (
          experiences.map((item, index) => (
            <div key={item.id ?? index} className="adm-row items-start">
              <div className="flex flex-col pt-0.5">
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn-sm"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0 || isReordering}
                  aria-label={`Naikkan ${item.role}`}
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="adm-icon-btn adm-icon-btn-sm"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === experiences.length - 1 || isReordering}
                  aria-label={`Turunkan ${item.role}`}
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <span className="adm-meta w-32 shrink-0 hidden sm:block pt-px">{item.period}</span>

              <div className="min-w-0 flex-1">
                <p className="font-medium">{item.role}</p>
                <p className="adm-meta">
                  {item.organization}
                  {item.location ? `, ${item.location}` : ""}
                </p>
                <p className="adm-faint sm:hidden">{item.period}</p>
                <p className="adm-meta mt-1.5 line-clamp-2 max-w-[70ch]">{item.description}</p>
              </div>

              <span className="adm-faint shrink-0 hidden md:block pt-px">{item.type}</span>

              <div className="flex shrink-0">
                <button
                  type="button"
                  className="adm-icon-btn"
                  onClick={() => openForm(item)}
                  aria-label={`Edit ${item.role}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {item.id && (
                  <button
                    type="button"
                    className="adm-icon-btn adm-icon-btn-danger"
                    onClick={() => setDeleteTarget(item)}
                    aria-label={`Hapus ${item.role}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog
        open={isFormOpen}
        title={editing ? "Edit pengalaman" : "Pengalaman baru"}
        onClose={() => setIsFormOpen(false)}
        width={600}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="adm-notice adm-notice-error">{formError}</div>}

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Peran" htmlFor="exp-role">
              <input id="exp-role" required className="adm-input" value={form.role} onChange={update("role")} />
            </Field>
            <Field label="Organisasi" htmlFor="exp-org">
              <input
                id="exp-org"
                required
                className="adm-input"
                value={form.organization}
                onChange={update("organization")}
              />
            </Field>
            <Field label="Periode" htmlFor="exp-period" hint="Contoh: 2023 – sekarang">
              <input id="exp-period" required className="adm-input" value={form.period} onChange={update("period")} />
            </Field>
            <Field label="Jenis" htmlFor="exp-type">
              <select id="exp-type" className="adm-input" value={form.type} onChange={update("type")}>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Lokasi" htmlFor="exp-location" optional>
            <input id="exp-location" className="adm-input" value={form.location} onChange={update("location")} />
          </Field>

          <Field label="Deskripsi" htmlFor="exp-desc">
            <textarea
              id="exp-desc"
              required
              rows={3}
              className="adm-input"
              value={form.description}
              onChange={update("description")}
            />
          </Field>

          <Field label="Poin penting" htmlFor="exp-highlights" optional hint="Satu poin per baris.">
            <textarea
              id="exp-highlights"
              rows={4}
              className="adm-input"
              value={form.highlights}
              onChange={update("highlights")}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="adm-btn adm-btn-quiet" onClick={() => setIsFormOpen(false)}>
              Batal
            </button>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan…" : editing ? "Simpan perubahan" : "Simpan pengalaman"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus pengalaman?"
        message={
          <>
            <strong style={{ color: "var(--ink)" }}>{deleteTarget?.role}</strong> di{" "}
            {deleteTarget?.organization} akan dihapus dari situs.
          </>
        }
        confirmLabel="Hapus pengalaman"
        pending={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
