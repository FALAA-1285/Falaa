"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Mail,
  Quote,
  Eye,
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/SocialIcons";
import { PersonalInfo } from "@/types/portfolio";
import { updateProfileInfoAction } from "@/actions/admin/profile";

interface ProfileFormProps {
  initialProfile: PersonalInfo;
}

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PersonalInfo>(initialProfile);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(false);
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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-black" />
            <span>Manajemen Profil &amp; Biodata (CRUD)</span>
          </h2>
          <p className="text-xs text-neutral-500 font-medium mt-0.5">
            Perbarui nama, profesi, deskripsi About, quote, dan link sosial yang tampil di portofolio publik.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-200">
          <Globe className="w-3.5 h-3.5 text-black" />
          <span>Sinkronisasi Otomatis ke PostgreSQL</span>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-neutral-900 text-white flex items-center gap-3 text-xs sm:text-sm animate-fade-in shadow-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profil berhasil diperbarui dan tersimpan di database PostgreSQL! Perubahan langsung aktif di homepage.</span>
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
        <div className="lg:col-span-2 space-y-5 bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs">
          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2">
            Informasi Personal Utama
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
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
                onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
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
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
                Institusi / Kampus
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
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
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black focus:ring-1 focus:ring-black"
              />
            </div>
          </div>

          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2 pt-2">
            Tautan Profil Sosial
          </h3>

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
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
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
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
                />
              </div>
            </div>
          </div>

          <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-2 pt-2">
            Quote &amp; Narasi Profil
          </h3>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Quote / Semboyan Personal
            </label>
            <input
              type="text"
              value={formData.quote}
              onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Deskripsi Section &quot;About&quot; *
            </label>
            <textarea
              required
              rows={4}
              value={formData.about}
              onChange={(e) => setFormData({ ...formData, about: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              Deskripsi Tambahan / Keahlian Khusus (About Sub)
            </label>
            <textarea
              rows={3}
              value={formData.aboutSub}
              onChange={(e) => setFormData({ ...formData, aboutSub: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-neutral-300 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-black resize-none"
            />
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke PostgreSQL...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 1 Col: Live Preview Silhouette Card */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-xs sticky top-20">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-black" />
              <span>Pratinjau Langsung (Preview)</span>
            </h3>

            {/* Monochrome Profile Card Preview */}
            <div className="p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-3 relative overflow-hidden">
              {/* Silhouette accent */}
              <div className="w-16 h-16 rounded-full bg-black text-white font-black text-xl flex items-center justify-center mx-auto shadow-md">
                {formData.name.slice(0, 1)}
              </div>

              <div>
                <h4 className="text-base font-extrabold text-neutral-900">
                  {formData.name || "NAMA"}
                </h4>
                <p className="text-xs font-bold text-neutral-600">
                  {formData.title || "Web Developer"}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {formData.location || "Indonesia"}
                </p>
              </div>

              {formData.quote && (
                <div className="pt-2 border-t border-neutral-200/80 text-[11px] italic text-neutral-600 font-serif flex items-center justify-center gap-1">
                  <Quote className="w-3 h-3 text-neutral-400 shrink-0" />
                  <span>&quot;{formData.quote}&quot;</span>
                </div>
              )}

              <div className="text-[11px] text-neutral-500 line-clamp-3 text-left pt-2 border-t border-neutral-200/80">
                {formData.about}
              </div>

              <div className="pt-2 flex justify-center gap-3 text-neutral-700">
                {formData.email && (
                  <span className="p-1.5 rounded-lg bg-white border border-neutral-200">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                )}
                {formData.github && (
                  <span className="p-1.5 rounded-lg bg-white border border-neutral-200">
                    <GithubIcon className="w-3.5 h-3.5 text-neutral-800" />
                  </span>
                )}
                {formData.linkedin && (
                  <span className="p-1.5 rounded-lg bg-white border border-neutral-200">
                    <LinkedinIcon className="w-3.5 h-3.5 text-neutral-800" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
