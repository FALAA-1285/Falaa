"use client";

import React, { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { LinkedinIcon, GithubIcon } from "@/components/ui/SocialIcons";
import { PERSONAL_INFO } from "@/data/portfolio";
import { PersonalInfo } from "@/types/portfolio";
import { sendContactMessageAction } from "@/actions/contact";

export default function Contact({ profile }: { profile?: PersonalInfo }) {
  const activeProfile = profile || PERSONAL_INFO;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
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
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setError(res.error || "Gagal mengirim pesan.");
      }
    } catch {
      setError("Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="my-28 sm:my-36 mb-[10rem] bg-white text-black scroll-mt-24">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-black">
            Let&apos;s work together.
          </h2>
          <p className="text-lg md:text-xl text-gray-600 font-normal">
            I&apos;m open to internships, freelance projects, and collaboration opportunities.
          </p>
        </div>

        {/* Contact Links */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 text-center mb-16">
          {/* Email */}
          <div className="flex items-center gap-2.5 text-base md:text-lg text-gray-800">
            <Mail className="w-5 h-5 text-black shrink-0" />
            <a
              href={`mailto:${activeProfile.email}`}
              className="underline hover:text-black transition-colors"
            >
              {activeProfile.email}
            </a>
          </div>

          {/* LinkedIn */}
          <div className="flex items-center gap-2.5 text-base md:text-lg text-gray-800">
            <LinkedinIcon className="w-5 h-5 text-black shrink-0" />
            <a
              href={activeProfile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black transition-colors"
            >
              LinkedIn Profile
            </a>
          </div>

          {/* GitHub */}
          <div className="flex items-center gap-2.5 text-base md:text-lg text-gray-800">
            <GithubIcon className="w-5 h-5 text-black shrink-0" />
            <a
              href={activeProfile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black transition-colors"
            >
              {activeProfile.handle || "GitHub Profile"}
            </a>
          </div>
        </div>

        {/* Interactive Direct Message Form */}
        <div className="max-w-2xl mx-auto bg-neutral-50/70 border border-neutral-200 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle monochrome accent silhouette background */}
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-neutral-200/40 rounded-full blur-2xl pointer-events-none" />

          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-1">
              Send a Direct Message
            </h3>
            <p className="text-sm text-neutral-500">
              Leave your inquiry or opportunity details below. I&apos;ll get back to you as soon as possible.
            </p>
          </div>

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-neutral-900 text-white flex items-center gap-3 text-sm animate-fade-in shadow-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Terima kasih! Pesan Anda telah terkirim dan tersimpan langsung di database kami.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Collaboration, Job Opportunity, etc."
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                Message *
              </label>
              <textarea
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell me about your project, idea, or inquiry..."
                className="w-full px-3.5 py-2.5 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-black hover:bg-neutral-800 active:scale-[0.99] text-white text-sm font-semibold rounded-lg transition shadow-sm cursor-pointer disabled:opacity-50"
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
          </form>
        </div>
      </div>
    </section>
  );
}
