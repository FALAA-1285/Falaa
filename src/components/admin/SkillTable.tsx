"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  Search,
} from "lucide-react";
import { SkillItem } from "@/types/skills";
import {
  createSkillAction,
  updateSkillAction,
  deleteSkillAction,
} from "@/actions/admin/skills";

const PRESET_ICONS = [
  "javascript.svg",
  "typescript.svg",
  "php.svg",
  "python.svg",
  "java.svg",
  "dart.svg",
  "html5.svg",
  "css3.svg",
  "react.svg",
  "nextjs.svg",
  "tailwindcss.svg",
  "flutter.svg",
  "laravel.svg",
  "django.svg",
  "nodejs.svg",
  "postgresql.svg",
  "mysql.svg",
  "supabase.svg",
  "git.svg",
  "github.svg",
  "figma.svg",
  "vscode.svg",
  "opencv.svg",
  "tensorflow.svg",
  "pytorch.svg",
  "scikitlearn.svg",
];

const PRESET_CATEGORIES = [
  "Programming Languages",
  "Frontend",
  "Backend",
  "Databases",
  "Tools & Machine Learning",
];

interface SkillTableProps {
  initialSkills: SkillItem[];
}

export default function SkillTable({ initialSkills }: SkillTableProps) {
  const router = useRouter();
  const [skills, setSkills] = useState<SkillItem[]>(initialSkills);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SkillItem | null>(null);

  // Form
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [customCategory, setCustomCategory] = useState("");
  const [icon, setIcon] = useState("nextjs.svg");
  const [customIcon, setCustomIcon] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingItem(null);
    setName("");
    setCategory("Frontend");
    setCustomCategory("");
    setIcon("nextjs.svg");
    setCustomIcon("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: SkillItem) => {
    setEditingItem(item);
    setName(item.name);
    setCategory(item.category || "Frontend");
    setCustomCategory("");
    setIcon(item.icon);
    setCustomIcon("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const finalCategory = customCategory.trim() ? customCategory.trim() : category;
    const finalIcon = customIcon.trim() ? customIcon.trim() : icon;

    try {
      if (editingItem && editingItem.id) {
        const res = await updateSkillAction(editingItem.id, {
          name,
          category: finalCategory,
          icon: finalIcon,
        });

        if (res.success && res.skill) {
          setSkills((prev) =>
            prev.map((s) => (s.id === editingItem.id ? res.skill! : s))
          );
          setIsModalOpen(false);
          router.refresh();
        } else {
          setFormError(res.error || "Gagal memperbarui skill.");
        }
      } else {
        const res = await createSkillAction({
          name,
          category: finalCategory,
          icon: finalIcon,
        });

        if (res.success && res.skill) {
          setSkills((prev) => [...prev, res.skill!]);
          setIsModalOpen(false);
          router.refresh();
        } else {
          setFormError(res.error || "Gagal menambahkan skill.");
        }
      }
    } catch {
      setFormError("Terjadi kesalahan sistem saat memproses.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus skill ini?")) return;
    try {
      const res = await deleteSkillAction(id);
      if (res.success) {
        setSkills((prev) => prev.filter((s) => s.id !== id));
        router.refresh();
      } else {
        alert(res.error || "Gagal menghapus skill.");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  // Filter skills
  const filteredSkills = skills.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase().trim());
    const matchCat = selectedCat === "ALL" || s.category === selectedCat;
    return matchSearch && matchCat;
  });

  // Group filtered skills
  const categoriesInFiltered = Array.from(
    new Set(filteredSkills.map((s) => s.category || "General"))
  );

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Layers className="w-5 h-5 text-black" />
            <span>Manajemen Technical Skills</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Daftar teknologi, bahasa pemrograman, tools, dan database di portofolio.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Skill Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama skill..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-neutral-500 font-semibold whitespace-nowrap">Kategori:</span>
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="w-full sm:w-auto text-xs bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-neutral-800 focus:outline-none focus:border-black font-medium"
          >
            <option value="ALL">Semua Kategori ({skills.length})</option>
            {PRESET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grouped Skills Grid */}
      <div className="space-y-6">
        {categoriesInFiltered.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-neutral-400">
            <Layers className="w-10 h-10 mx-auto text-neutral-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-neutral-700">Tidak ada skill yang cocok</p>
            <p className="text-xs text-neutral-400 mt-1">Coba sesuaikan kata kunci atau filter kategori.</p>
          </div>
        ) : (
          categoriesInFiltered.map((catName) => {
            const groupSkills = filteredSkills.filter((s) => (s.category || "General") === catName);

            return (
              <div
                key={catName}
                className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-6"
              >
                <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3 mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-black" />
                    <h3 className="text-sm sm:text-base font-bold text-neutral-900">
                      {catName}
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2.5 py-0.5 rounded-full border border-neutral-200">
                    {groupSkills.length} item
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {groupSkills.map((skill) => (
                    <div
                      key={skill.id ?? skill.name}
                      className="group p-3.5 rounded-xl bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200 transition-all flex flex-col items-center justify-between gap-2.5 relative"
                    >
                      {/* Action buttons on hover */}
                      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditModal(skill)}
                          className="p-1 rounded bg-white text-neutral-700 hover:text-black border border-neutral-200 shadow-xs"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        {skill.id && (
                          <button
                            onClick={() => handleDelete(skill.id!)}
                            className="p-1 rounded bg-white text-red-500 hover:text-red-700 border border-neutral-200 shadow-xs"
                            title="Hapus"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Icon preview */}
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center p-1 bg-white border border-neutral-200 shadow-xs mt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/icons/${skill.icon}`}
                          alt={skill.name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                      </div>

                      <div className="text-center w-full">
                        <span className="text-xs font-bold text-neutral-900 block truncate">
                          {skill.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate">
                          {skill.icon}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Skill Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              {editingItem ? "Edit Technical Skill" : "Tambah Skill Baru"}
            </h3>
            <p className="text-xs text-neutral-500 mb-5">
              Simpan untuk langsung ditampilkan di portofolio dengan efek monokrom otomatis.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Nama Skill / Teknologi *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: React, Go, Docker, Flutter"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Kategori *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black mb-2"
                >
                  {PRESET_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                  <option value="Custom">Kategori Baru (Kustom)...</option>
                </select>

                {category === "Custom" && (
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ketik nama kategori baru..."
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Pilih Ikon SVG (dari direktori public/icons) *
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black mb-2"
                >
                  {PRESET_ICONS.map((ic) => (
                    <option key={ic} value={ic}>
                      {ic}
                    </option>
                  ))}
                  <option value="Custom">Nama File SVG Kustom...</option>
                </select>

                {icon === "Custom" && (
                  <input
                    type="text"
                    required
                    value={customIcon}
                    onChange={(e) => setCustomIcon(e.target.value)}
                    placeholder="Contoh: myicon.svg"
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Perbarui Skill" : "Simpan Skill"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
