"use client";

import React, { useState } from "react";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/SocialIcons";
import { DEFAULT_PERSONAL_INFO } from "@/lib/constants";
import { PersonalInfo } from "@/types/portfolio";
import { sendContactMessageAction } from "@/actions/contact";

export default function Contact({ profile }: { profile?: PersonalInfo }) {
  const activeProfile = profile || DEFAULT_PERSONAL_INFO;

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const res = await sendContactMessageAction(formData);
      if (res.success) {
        setSuccess(true);
        setFormData({ name: "", email: "", subject: "", message: "", honeypot: "" });
      } else {
        setError(res.error || "Gagal mengirim pesan.");
      }
    } catch {
      setError("Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ctaHeadline = activeProfile.ctaHeadline || "Let's Connect and Collaborate!";
  const ctaSub =
    activeProfile.ctaSub ||
    "Open for internship opportunities, freelance projects, or just chatting about Web Development, Fullstack Systems, and UI/UX Design.";
  const ctaButtonText = activeProfile.ctaButtonText || "Let's Talk";

  return (
    <section id="contact" className="py-20 sm:py-28 bg-white text-black scroll-mt-24 relative">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Seamlessly Integrated Card matching the Portfolio Design DNA */}
        <div className="relative rounded-[2rem] sm:rounded-[2.5rem] p-8 sm:p-16 md:p-20 border border-black/10 bg-[#FAFAFA] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.04)] overflow-hidden text-center flex flex-col items-center justify-center transition-all duration-300">
          {/* Subtle Giant Typography Watermark Echoing Hero & Skills */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden -z-0">
            <span className="text-[5.5rem] sm:text-[9.5rem] md:text-[13rem] font-extrabold text-black/[0.03] tracking-widest uppercase whitespace-nowrap">
              CONNECT
            </span>
          </div>

          {/* Heading matching the site's typography */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-black tracking-tight mb-4 relative z-10">
            {ctaHeadline}
          </h2>

          {/* Subheading with natural editorial styling */}
          <p className="text-base sm:text-lg md:text-xl text-black/60 font-normal max-w-xl mx-auto leading-relaxed mb-8 sm:mb-10 relative z-10">
            {ctaSub}
          </p>

          {/* Primary Action Button: "Let's Talk" */}
          <div className="relative z-10">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 bg-black hover:bg-neutral-800 text-white font-medium rounded-full text-sm sm:text-base shadow-sm hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer group"
            >
              <span>{showForm ? "Tutup Formulir" : ctaButtonText}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-300 ${
                  showForm ? "rotate-180" : "group-hover:translate-y-0.5"
                }`}
              />
            </button>
          </div>

          {/* Direct Social / Contact Badges */}
          <div className="mt-8 pt-6 border-t border-black/10 w-full max-w-lg flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-black/60 relative z-10 font-normal">
            <a
              href={`mailto:${activeProfile.email}`}
              className="inline-flex items-center gap-1.5 hover:text-black transition-colors"
            >
              <Mail className="w-4 h-4 text-black" />
              <span>{activeProfile.email}</span>
            </a>

            {activeProfile.linkedin && (
              <>
                <span className="text-black/20 hidden sm:inline">•</span>
                <a
                  href={activeProfile.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-black transition-colors"
                >
                  <LinkedinIcon className="w-4 h-4 text-black" />
                  <span>LinkedIn</span>
                </a>
              </>
            )}

            {activeProfile.github && (
              <>
                <span className="text-black/20 hidden sm:inline">•</span>
                <a
                  href={activeProfile.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-black transition-colors"
                >
                  <GithubIcon className="w-4 h-4 text-black" />
                  <span>GitHub</span>
                </a>
              </>
            )}
          </div>

          {/* Integrated Smooth In-Card Form */}
          {showForm && (
            <div className="w-full max-w-xl mt-8 pt-8 border-t border-black/10 relative z-10 text-left animate-fade-in">
              <div className="mb-5 text-center">
                <h3 className="text-lg font-semibold text-black">
                  Kirim Pesan Langsung
                </h3>
                <p className="text-xs text-black/50 mt-0.5">
                  Pesan Anda akan langsung masuk ke database dan notifikasi admin.
                </p>
              </div>

              {success && (
                <div className="mb-5 p-4 rounded-2xl bg-black text-white flex items-center gap-3 text-xs sm:text-sm animate-fade-in shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>Pesan Anda telah berhasil terkirim dan tersimpan di database! Terima kasih.</span>
                </div>
              )}

              {error && (
                <div className="mb-5 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-xs sm:text-sm">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Honeypot field for bot deterrence (invisible to humans) */}
                <div className="hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="hp_website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={formData.honeypot}
                    onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                      Nama Anda *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                      Email Anda *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                    Subjek
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Internship, Freelance, Collaboration..."
                    className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/70 uppercase tracking-wider mb-1.5">
                    Pesan *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tuliskan pesan atau detail peluang Anda..."
                    className="w-full px-4 py-2.5 bg-white border border-black/10 rounded-xl text-sm text-black placeholder:text-black/30 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-none"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-7 py-3 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-full transition shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Mengirim...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Kirim Pesan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
