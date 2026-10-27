"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  X,
  Loader2,
  AlertCircle,
  Building,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ExperienceItem } from "@/types/portfolio";
import {
  createExperienceAction,
  updateExperienceAction,
  deleteExperienceAction,
} from "@/actions/admin/experiences";
import { reorderExperiencesAction } from "@/actions/admin/reorder";

interface ExperienceTableProps {
  initialExperiences: ExperienceItem[];
}

export default function ExperienceTable({
  initialExperiences,
}: ExperienceTableProps) {
  const router = useRouter();
  const [experiences, setExperiences] = useState<ExperienceItem[]>(initialExperiences);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExperienceItem | null>(null);

  // Form State
  const [period, setPeriod] = useState("");
  const [role, setRole] = useState("");
  const [organization, setOrganization] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("Academic Degree");
  const [description, setDescription] = useState("");
  const [highlightsText, setHighlightsText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const handleMove = async (expId: number, direction: "up" | "down") => {
    const currentIndex = experiences.findIndex((e) => e.id === expId);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === experiences.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const updated = [...experiences];
    const [moved] = updated.splice(currentIndex, 1);
    updated.splice(targetIndex, 0, moved);

    const reordered = updated.map((e, idx) => ({ ...e, order_index: idx }));
    setExperiences(reordered);
    setIsReordering(true);

    try {
      const orderedIds = reordered.map((e) => e.id!).filter(Boolean);
      const res = await reorderExperiencesAction(orderedIds);
      if (!res.success) {
        alert(res.error || "Gagal mengubah urutan pengalaman.");
        setExperiences(experiences);
      } else {
        router.refresh();
      }
    } catch {
      alert("Terjadi kesalahan koneksi saat menyimpan urutan.");
      setExperiences(experiences);
    } finally {
      setIsReordering(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setPeriod("");
    setRole("");
    setOrganization("");
    setLocation("Malang, Indonesia");
    setType("Academic Degree");
    setDescription("");
    setHighlightsText("");
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ExperienceItem) => {
    setEditingItem(item);
    setPeriod(item.period);
    setRole(item.role);
    setOrganization(item.organization);
    setLocation(item.location || "");
    setType(item.type);
    setDescription(item.description);
    setHighlightsText(item.highlights ? item.highlights.join("\n") : "");
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const highlights = highlightsText
      .split("\n")
      .map((h) => h.trim())
      .filter(Boolean);

    try {
      if (editingItem && editingItem.id) {
        const res = await updateExperienceAction(editingItem.id, {
          period,
          role,
          organization,
          location,
          type,
          description,
          highlights,
        });

        if (res.success && res.experience) {
          setExperiences((prev) =>
            prev.map((e) => (e.id === editingItem.id ? res.experience! : e))
          );
          setIsModalOpen(false);
          router.refresh();
        } else {
          setFormError(res.error || "Gagal memperbarui pengalaman.");
        }
      } else {
        const res = await createExperienceAction({
          period,
          role,
          organization,
          location,
          type,
          description,
          highlights,
        });

        if (res.success && res.experience) {
          setExperiences((prev) => [...prev, res.experience!]);
          setIsModalOpen(false);
          router.refresh();
        } else {
          setFormError(res.error || "Gagal menambahkan pengalaman.");
        }
      }
    } catch {
      setFormError("Terjadi kesalahan saat memproses data.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengalaman ini?")) return;
    setIsDeleting(true);
    try {
      const res = await deleteExperienceAction(id);
      if (res.success) {
        setExperiences((prev) => prev.filter((e) => e.id !== id));
        router.refresh();
      } else {
        alert(res.error || "Gagal menghapus pengalaman.");
      }
    } catch {
      alert("Terjadi kesalahan saat menghapus data.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-black" />
            <span>Manajemen Riwayat Pengalaman</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Kelola rekam jejak akademik, magang, pekerjaan, dan proyek independen di portofolio.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengalaman Baru</span>
        </button>
      </div>

      {/* Experience Cards / Timeline View */}
      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-neutral-400">
            <Briefcase className="w-10 h-10 mx-auto text-neutral-300 mb-2 stroke-[1.5]" />
            <p className="text-sm font-semibold text-neutral-700">Belum ada data pengalaman</p>
            <p className="text-xs text-neutral-400 mt-1">Klik tombol &quot;Tambah Pengalaman Baru&quot; di atas untuk menambahkan.</p>
          </div>
        ) : (
          experiences.map((item, idx) => (
            <div
              key={item.id ?? idx}
              className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs hover:border-black/40 transition-all relative overflow-hidden"
            >
              {/* Subtle black silhouette card watermark */}
              <div className="absolute right-0 top-0 bottom-0 w-28 bg-gradient-to-l from-neutral-100/50 to-transparent pointer-events-none" />

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                <div className="space-y-2 max-w-3xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black text-white text-[11px] font-bold">
                      <Calendar className="w-3 h-3" />
                      {item.period}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-semibold border border-neutral-200">
                      {item.type}
                    </span>
                    {item.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-neutral-500 font-medium">
                        <MapPin className="w-3 h-3 text-neutral-400" />
                        {item.location}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
                    {item.role}
                  </h3>

                  <div className="text-xs sm:text-sm font-semibold text-neutral-700 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-neutral-500" />
                    <span>{item.organization}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-1">
                    {item.description}
                  </p>

                  {item.highlights && item.highlights.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider block mb-1">
                        Poin Sorotan (Highlights):
                      </span>
                      <ul className="space-y-1 text-xs text-neutral-600 list-disc list-inside">
                        {item.highlights.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center sm:flex-col gap-1.5 shrink-0">
                  <div className="flex sm:flex-col gap-1 items-center">
                    <button
                      onClick={() => handleMove(item.id!, "up")}
                      disabled={idx === 0 || isReordering}
                      className="p-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-neutral-50 text-neutral-600 transition cursor-pointer"
                      title="Pindahkan ke atas"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMove(item.id!, "down")}
                      disabled={idx === experiences.length - 1 || isReordering}
                      className="p-1.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-neutral-50 text-neutral-600 transition cursor-pointer"
                      title="Pindahkan ke bawah"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 border border-neutral-200 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                    title="Edit Pengalaman"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span className="sm:hidden">Edit</span>
                  </button>

                  {item.id && (
                    <button
                      onClick={() => handleDelete(item.id!)}
                      disabled={isDeleting}
                      className="p-2 rounded-xl bg-neutral-100 hover:bg-red-600 hover:text-white text-neutral-600 border border-neutral-200 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title="Hapus Pengalaman"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden">Hapus</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-black p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              {editingItem ? "Edit Pengalaman" : "Tambah Pengalaman Baru"}
            </h3>
            <p className="text-xs text-neutral-500 mb-6">
              Data yang Anda simpan akan langsung diperbarui di website.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Periode (Waktu) *
                  </label>
                  <input
                    type="text"
                    required
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    placeholder="Contoh: 2023 - Present"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Kategori / Tipe *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  >
                    <option value="Academic Degree">Academic Degree</option>
                    <option value="Freelance & Projects">Freelance & Projects</option>
                    <option value="Research & Development">Research & Development</option>
                    <option value="Work / Internship">Work / Internship</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Peran / Posisi (Role) *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Contoh: Information Technology Undergraduate"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Organisasi / Instansi *
                  </label>
                  <input
                    type="text"
                    required
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="Contoh: Politeknik Negeri Malang"
                    className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Lokasi
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Malang, East Java, Indonesia"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Deskripsi Pengalaman *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ringkasan tugas, aktivitas, atau kontribusi utama..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Poin Sorotan (1 baris per poin)
                </label>
                <textarea
                  rows={3}
                  value={highlightsText}
                  onChange={(e) => setHighlightsText(e.target.value)}
                  placeholder="Masukkan poin sorotan, pisahkan dengan baris baru..."
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>{editingItem ? "Perbarui Pengalaman" : "Simpan Pengalaman"}</span>
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
