"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Quote,
  Eye,
  Plus,
  X,
  Tag,
  MessageSquare,
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/SocialIcons";
import { PersonalInfo } from "@/types/portfolio";
import { updateProfileInfoAction } from "@/actions/admin/profile";
import { profileSchema } from "@/lib/schemas/profile";
import { isSafeUrl } from "@/lib/security";

interface ProfileFormProps {
  initialProfile: PersonalInfo;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PersonalInfo>({
    ...initialProfile,
    aboutHeadline:
      initialProfile.aboutHeadline ||
      `Hey! I'm ${initialProfile.name || "FALAH"}, a ${initialProfile.title || "Web Developer"} based in ${initialProfile.location || "Malang, Indonesia"}.`,
    aboutTags: initialProfile.aboutTags || [
      "Web Development",
      "Mobile App Development",
      "API Development",
      "UI/UX Design",
    ],
    ctaHeadline: initialProfile.ctaHeadline || "Let's Connect and Collaborate!",
    ctaSub:
      initialProfile.ctaSub ||
      "Open for internship opportunities, freelance projects, or just chatting about Web Development, Fullstack Systems, and UI/UX Design.",
    ctaButtonText: initialProfile.ctaButtonText || "Let's Talk",
  });

  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !(formData.aboutTags || []).includes(trimmed)) {
      setFormData({
        ...formData,
        aboutTags: [...(formData.aboutTags || []), trimmed],
      });
      setTagInput("");
    }
  };

  const handleRemoveTag = (indexToRemove: number) => {
    const updated = (formData.aboutTags || []).filter(
      (_, idx) => idx !== indexToRemove
    );
    setFormData({ ...formData, aboutTags: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);

    // Client-side validation with strict URL and email allowlists
    const clientValidation = profileSchema.safeParse(formData);
    if (!clientValidation.success) {
      setErrorMsg(clientValidation.error.issues[0]?.message || "Validasi data profil gagal.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await updateProfileInfoAction(formData);
      if (res.success && res.profile) {
        setFormData(res.profile);
        setSuccessMsg(true);
        router.refresh();
      } else {
        setErrorMsg(res.error || "Gagal memperbarui profil.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan sistem saat memperbarui profil.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLinkedinValid = !formData.linkedin || isSafeUrl(formData.linkedin);
  const isGithubValid = !formData.github || isSafeUrl(formData.github);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-black" />
            <span>Manajemen Profil, Headline &amp; Tagline</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Perbarui teks headline, badge keahlian About, narasi profil, dan bagian CTA yang tampil di portofolio publik.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-neutral-900 text-white flex items-center gap-3 text-xs sm:text-sm animate-fade-in shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profil &amp; Headline berhasil diperbarui! Perubahan langsung aktif di homepage.</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs sm:text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Fields */}
        <div className="lg:col-span-2 space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200 shadow-xs">
          {/* SECTION 1: ABOUT HEADLINE & TAGS (Requested by user) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-black" />
                <span>Headline &amp; Badge Section &quot;About&quot;</span>
              </h3>
              <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                Tampil di Beranda
              </span>
            </div>

            {/* Headline Input (Image 1) */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Kalimat Headline Utama (About Intro) *
              </label>
              <textarea
                required
                rows={2}
                value={formData.aboutHeadline || ""}
                onChange={(e) =>
                  setFormData({ ...formData, aboutHeadline: e.target.value })
                }
                placeholder="Contoh: Hey! I'm FALAH, a Web Developer & IT Student based in Malang, Indonesia."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 font-medium focus:outline-none focus:border-black focus:ring-1 focus:ring-black resize-none"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                Ketik teks headline apa pun yang Anda inginkan (misal nama, peran, institusi, atau lokasi).
              </p>
            </div>

            {/* Focus Area Tags (Image 0) */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Badge / Tag Keahlian Utama (About Tags)
              </label>

              {/* Tag Badges List */}
              <div className="flex flex-wrap gap-2 mb-3 min-h-[38px] p-2.5 rounded-xl bg-neutral-50 border border-neutral-200">
                {(formData.aboutTags || []).length === 0 ? (
                  <span className="text-xs text-neutral-400 italic">
                    Belum ada badge. Tambahkan melalui input di bawah.
                  </span>
                ) : (
                  (formData.aboutTags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white text-neutral-900 border border-neutral-300 shadow-xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(idx)}
                        className="text-neutral-400 hover:text-red-600 transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Add Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="Ketik tag baru (misal: Cloud Computing, Machine Learning)..."
                  className="flex-1 px-3.5 py-2 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Tag</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 2: CTA "LET'S CONNECT" */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-black" />
              <span>Section Call-To-Action (Let&apos;s Connect &amp; Collaborate)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Judul Kartu CTA
                </label>
                <input
                  type="text"
                  value={formData.ctaHeadline || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaHeadline: e.target.value })
                  }
                  placeholder="Let's Connect and Collaborate!"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Teks Tombol CTA
                </label>
                <input
                  type="text"
                  value={formData.ctaButtonText || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, ctaButtonText: e.target.value })
                  }
                  placeholder="Let's Talk"
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Sub-deskripsi CTA
              </label>
              <textarea
                rows={2}
                value={formData.ctaSub || ""}
                onChange={(e) =>
                  setFormData({ ...formData, ctaSub: e.target.value })
                }
                placeholder="Open for internship opportunities, freelance projects..."
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          {/* SECTION 3: PERSONAL INFO */}
          <div className="space-y-4 pt-4 border-t border-neutral-200">
            <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
              Informasi Personal &amp; Bio
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Nama Lengkap / Panggilan *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Handle / Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.handle}
                  onChange={(e) =>
                    setFormData({ ...formData, handle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Title / Profesi *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Institusi / Kampus
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) =>
                    setFormData({ ...formData, institution: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Lokasi Domisili
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Email Kontak *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <LinkedinIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) =>
                      setFormData({ ...formData, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/..."
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black ${
                      !isLinkedinValid
                        ? "bg-red-50 border border-red-300"
                        : "bg-neutral-50 border border-neutral-300"
                    }`}
                  />
                </div>
                {!isLinkedinValid && (
                  <p className="text-[11px] text-red-600 mt-1">
                    URL LinkedIn harus menggunakan protokol https:// atau http://
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                  GitHub URL
                </label>
                <div className="relative">
                  <GithubIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.github}
                    onChange={(e) =>
                      setFormData({ ...formData, github: e.target.value })
                    }
                    placeholder="https://github.com/..."
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black ${
                      !isGithubValid
                        ? "bg-red-50 border border-red-300"
                        : "bg-neutral-50 border border-neutral-300"
                    }`}
                  />
                </div>
                {!isGithubValid && (
                  <p className="text-[11px] text-red-600 mt-1">
                    URL GitHub harus menggunakan protokol https:// atau http://
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Quote Personal
              </label>
              <input
                type="text"
                value={formData.quote}
                onChange={(e) =>
                  setFormData({ ...formData, quote: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Paragraf Deskripsi &quot;About&quot; *
              </label>
              <textarea
                required
                rows={4}
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Keahlian Khusus / Eksplorasi (About Sub)
              </label>
              <textarea
                rows={3}
                value={formData.aboutSub}
                onChange={(e) =>
                  setFormData({ ...formData, aboutSub: e.target.value })
                }
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto justify-center inline-flex items-center gap-2 px-7 py-3.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Semua Perubahan</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Preview */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs sticky top-20">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-black" />
              <span>Pratinjau Live About Section</span>
            </h3>

            {/* Live Preview Card */}
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-4 relative overflow-hidden">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Preview Headline:
                </span>
                <h4 className="text-sm sm:text-base font-semibold text-neutral-900 leading-snug">
                  {formData.aboutHeadline || "Headline belum diisi..."}
                </h4>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-2">
                  Preview Badges / Tags:
                </span>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {(formData.aboutTags || []).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 border border-black/10 rounded-full bg-white text-[11px] font-medium text-neutral-800 shadow-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {formData.quote && (
                <div className="pt-3 border-t border-neutral-200 text-[11px] italic text-neutral-600 font-serif flex items-center justify-center gap-1">
                  <Quote className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>&quot;{formData.quote}&quot;</span>
                </div>
              )}

              <div className="text-[11px] text-neutral-500 line-clamp-3 text-left pt-2 border-t border-neutral-200">
                {formData.about}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
