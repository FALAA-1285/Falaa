"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUp, ArrowDown, Pencil, Trash2 } from "lucide-react";
import { SkillItem } from "@/types/skills";
import { PRESET_SKILL_CATEGORIES, compareCategories } from "@/lib/constants/skills";
import { createSkillAction, updateSkillAction, deleteSkillAction } from "@/actions/admin/skills";
import { reorderSkillsAction } from "@/actions/admin/reorder";
import Dialog, { ConfirmDialog } from "./Dialog";
import Field from "./Field";
import PageHead from "./PageHead";

const PRESET_ICONS = [
  "javascript.svg", "typescript.svg", "php.svg", "python.svg", "java.svg", "dart.svg",
  "html5.svg", "css3.svg", "react.svg", "nextjs.svg", "tailwindcss.svg", "flutter.svg",
  "laravel.svg", "django.svg", "nodejs.svg", "postgresql.svg", "mysql.svg", "supabase.svg",
  "git.svg", "github.svg", "figma.svg", "vscode.svg", "opencv.svg", "tensorflow.svg",
  "pytorch.svg", "scikitlearn.svg", "vercel.svg", "n8n.svg",
];

const OTHER = "__other__";

interface FormState {
  name: string;
  category: string;
  customCategory: string;
  icon: string;
  customIcon: string;
}

function SkillIcon({ icon }: { icon: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/icons/${icon}`}
      alt=""
      className="w-5 h-5 object-contain shrink-0"
      onError={(e) => {
        (e.target as HTMLElement).style.visibility = "hidden";
      }}
    />
  );
}

interface SkillTableProps {
  initialSkills: SkillItem[];
}

export default function SkillTable({ initialSkills }: SkillTableProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills);
  const [error, setError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const [editing, setEditing] = useState<SkillItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    category: PRESET_SKILL_CATEGORIES[0],
    customCategory: "",
    icon: "nextjs.svg",
    customIcon: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<SkillItem | null>(null);
  const [isDeleting, startDelete] = useTransition();

  const categories = Array.from(
    new Set([...PRESET_SKILL_CATEGORIES, ...skills.map((s) => s.category || "General")])
  ).sort(compareCategories);
  const groups = categories
    .map((category) => ({
      category,
      items: skills.filter((s) => (s.category || "General") === category),
    }))
    .filter((g) => g.items.length > 0);

  const openForm = (item: SkillItem | null) => {
    const category = item?.category || PRESET_SKILL_CATEGORIES[0];
    const icon = item?.icon || "nextjs.svg";
    const knownCategory = categories.includes(category);
    const knownIcon = PRESET_ICONS.includes(icon);
    setEditing(item);
    setForm({
      name: item?.name || "",
      category: knownCategory ? category : OTHER,
      customCategory: knownCategory ? "" : category,
      icon: knownIcon ? icon : OTHER,
      customIcon: knownIcon ? "" : icon,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleMove = async (skill: SkillItem, direction: -1 | 1) => {
    const group = skills.filter((s) => s.category === skill.category);
    const groupIndex = group.findIndex((s) => s.id === skill.id);
    const neighbour = group[groupIndex + direction];
    if (!neighbour) return;

    const previous = skills;
    const a = skills.findIndex((s) => s.id === skill.id);
    const b = skills.findIndex((s) => s.id === neighbour.id);
    const updated = [...skills];
    [updated[a], updated[b]] = [updated[b], updated[a]];
    setSkills(updated);
    setIsReordering(true);
    setError(null);

    try {
      const res = await reorderSkillsAction(updated.map((s) => s.id!).filter(Boolean));
      if (!res.success) {
        setSkills(previous);
        setError(res.error || "Urutan skill gagal disimpan.");
      } else {
        router.refresh();
      }
    } catch {
      setSkills(previous);
      setError("Urutan skill gagal disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsReordering(false);
    }
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      name: form.name,
      category: form.category === OTHER ? form.customCategory.trim() : form.category,
      icon: form.icon === OTHER ? form.customIcon.trim() : form.icon,
    };

    try {
      const res = editing?.id
        ? await updateSkillAction(editing.id, payload)
        : await createSkillAction(payload);

      if (res.success && res.skill) {
        const saved = res.skill;
        setSkills((prev) =>
          editing?.id ? prev.map((s) => (s.id === editing.id ? saved : s)) : [...prev, saved]
        );
        setIsFormOpen(false);
        router.refresh();
      } else {
        setFormError(res.error || "Skill gagal disimpan.");
      }
    } catch {
      setFormError("Skill gagal disimpan. Periksa koneksi lalu coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = () => {
    const id = deleteTarget?.id;
    if (!id) return;
    startDelete(async () => {
      const res = await deleteSkillAction(id);
      setDeleteTarget(null);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      } else {
        setError(res.error || "Skill gagal dihapus.");
      }
    });
  };

  const previewIcon = form.icon === OTHER ? form.customIcon.trim() : form.icon;

  return (
    <>
      <PageHead
        title="Skill"
        lede="Dikelompokkan per kategori. Urutan di tiap kategori sama dengan di situs."
        action={
          <button type="button" className="adm-btn adm-btn-primary" onClick={() => openForm(null)}>
            Tambah skill
          </button>
        }
      />

      {error && <div className="adm-notice adm-notice-error mb-4">{error}</div>}

      {groups.length === 0 ? (
        <div className="adm-panel adm-section adm-meta">Belum ada skill. Tambahkan teknologi yang kamu kuasai.</div>
      ) : (
        <div className="adm-panel">
          {groups.map(({ category, items }) => (
            <section key={category} className="adm-section">
              <h2 className="adm-h2 mb-2">
                {category} <span className="adm-faint font-normal">{items.length}</span>
              </h2>
              <ul className="grid sm:grid-cols-2 gap-x-6">
                {items.map((skill, index) => (
                  <li
                    key={skill.id ?? skill.name}
                    className="flex items-center gap-2 py-1.5"
                    style={{ borderBottom: "1px solid var(--line-soft)" }}
                  >
                    <SkillIcon icon={skill.icon} />
                    <button
                      type="button"
                      className="flex-1 min-w-0 truncate text-left cursor-pointer hover:underline"
                      onClick={() => openForm(skill)}
                    >
                      {skill.name}
                    </button>
                    <div className="flex shrink-0">
                      <button
                        type="button"
                        className="adm-icon-btn adm-icon-btn-sm"
                        onClick={() => handleMove(skill, -1)}
                        disabled={index === 0 || isReordering}
                        aria-label={`Naikkan ${skill.name}`}
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn adm-icon-btn-sm"
                        onClick={() => handleMove(skill, 1)}
                        disabled={index === items.length - 1 || isReordering}
                        aria-label={`Turunkan ${skill.name}`}
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn adm-icon-btn-sm"
                        onClick={() => openForm(skill)}
                        aria-label={`Edit ${skill.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      {skill.id && (
                        <button
                          type="button"
                          className="adm-icon-btn adm-icon-btn-sm adm-icon-btn-danger"
                          onClick={() => setDeleteTarget(skill)}
                          aria-label={`Hapus ${skill.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Dialog
        open={isFormOpen}
        title={editing ? "Edit skill" : "Skill baru"}
        onClose={() => setIsFormOpen(false)}
        width={460}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && <div className="adm-notice adm-notice-error">{formError}</div>}

          <Field label="Nama" htmlFor="skill-name">
            <input
              id="skill-name"
              required
              className="adm-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label="Kategori" htmlFor="skill-category">
            <select
              id="skill-category"
              className="adm-input"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value={OTHER}>Kategori baru…</option>
            </select>
            {form.category === OTHER && (
              <input
                required
                className="adm-input"
                aria-label="Nama kategori baru"
                placeholder="Nama kategori"
                value={form.customCategory}
                onChange={(e) => setForm({ ...form, customCategory: e.target.value })}
              />
            )}
          </Field>

          <Field label="Ikon" htmlFor="skill-icon" hint="Berkas dari folder public/icons.">
            <div className="flex items-center gap-2">
              <select
                id="skill-icon"
                className="adm-input"
                value={form.icon}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
              >
                {PRESET_ICONS.map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
                <option value={OTHER}>Nama berkas lain…</option>
              </select>
              {previewIcon && <SkillIcon key={previewIcon} icon={previewIcon} />}
            </div>
            {form.icon === OTHER && (
              <input
                required
                className="adm-input"
                aria-label="Nama berkas ikon"
                placeholder="docker.svg"
                value={form.customIcon}
                onChange={(e) => setForm({ ...form, customIcon: e.target.value })}
              />
            )}
          </Field>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="adm-btn adm-btn-quiet" onClick={() => setIsFormOpen(false)}>
              Batal
            </button>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan…" : editing ? "Simpan perubahan" : "Simpan skill"}
            </button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus skill?"
        message={
          <>
            <strong style={{ color: "var(--ink)" }}>{deleteTarget?.name}</strong> akan dihapus dari situs.
          </>
        }
        confirmLabel="Hapus skill"
        pending={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </>
  );
}
