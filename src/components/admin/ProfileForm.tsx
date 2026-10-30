"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PersonalInfo } from "@/types/portfolio";
import { updateProfileInfoAction } from "@/actions/admin/profile";
import { profileSchema } from "@/lib/schemas/profile";
import { isSafeUrl } from "@/lib/security";
import Field from "./Field";
import PageHead from "./PageHead";

interface ProfileFormProps {
  initialProfile: PersonalInfo;
}

type TextKey = Exclude<keyof PersonalInfo, "aboutTags">;

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PersonalInfo>({
    ...initialProfile,
    aboutTags: initialProfile.aboutTags || [],
  });
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);

  const text = (key: TextKey) => ({
    id: `profile-${key}`,
    className: "adm-input",
    value: form[key] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
      setStatus(null);
    },
  });

  const tags = form.aboutTags || [];
  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setForm({ ...form, aboutTags: [...tags, trimmed] });
    }
    setTagInput("");
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus(null);

    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      setStatus({ ok: false, text: parsed.error.issues[0]?.message || "Periksa kembali isian profil." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateProfileInfoAction(form);
      if (res.success && res.profile) {
        setForm({ ...res.profile, aboutTags: res.profile.aboutTags || [] });
        setStatus({ ok: true, text: "Profil disimpan dan sudah tampil di situs." });
        router.refresh();
      } else {
        setStatus({ ok: false, text: res.error || "Profil gagal disimpan." });
      }
    } catch {
      setStatus({ ok: false, text: "Profil gagal disimpan. Periksa koneksi lalu coba lagi." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const linkedinError = form.linkedin && !isSafeUrl(form.linkedin) ? "Gunakan URL lengkap yang diawali https://" : undefined;
  const githubError = form.github && !isSafeUrl(form.github) ? "Gunakan URL lengkap yang diawali https://" : undefined;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PageHead title="Profil" lede="Teks tentang kamu yang tampil di beranda, bagian About, dan ajakan kontak." />

      <div className="adm-panel">
        <section className="adm-section space-y-4">
          <h2 className="adm-h2">Identitas</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nama" htmlFor="profile-name">
              <input {...text("name")} required />
            </Field>
            <Field label="Handle" htmlFor="profile-handle">
              <input {...text("handle")} required />
            </Field>
            <Field label="Profesi" htmlFor="profile-title">
              <input {...text("title")} required />
            </Field>
            <Field label="Institusi" htmlFor="profile-institution" optional>
              <input {...text("institution")} />
            </Field>
            <Field label="Lokasi" htmlFor="profile-location" optional>
              <input {...text("location")} />
            </Field>
            <Field label="Email kontak" htmlFor="profile-email">
              <input {...text("email")} type="email" required />
            </Field>
            <Field label="LinkedIn" htmlFor="profile-linkedin" optional error={linkedinError}>
              <input {...text("linkedin")} type="url" aria-invalid={!!linkedinError} />
            </Field>
            <Field label="GitHub" htmlFor="profile-github" optional error={githubError}>
              <input {...text("github")} type="url" aria-invalid={!!githubError} />
            </Field>
          </div>
        </section>

        <section className="adm-section space-y-4">
          <h2 className="adm-h2">Bagian About</h2>
          <Field label="Kalimat pembuka" htmlFor="profile-aboutHeadline">
            <textarea {...text("aboutHeadline")} rows={2} />
          </Field>
          <Field label="Paragraf utama" htmlFor="profile-about">
            <textarea {...text("about")} rows={5} required />
          </Field>
          <Field label="Paragraf tambahan" htmlFor="profile-aboutSub" optional>
            <textarea {...text("aboutSub")} rows={3} />
          </Field>
          <Field label="Bidang fokus" htmlFor="profile-tag-input" hint="Tampil sebagai label di bawah paragraf. Tekan Enter untuk menambahkan.">
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, idx) => (
                  <span key={tag} className="adm-chip">
                    {tag}
                    <button
                      type="button"
                      className="cursor-pointer"
                      style={{ color: "var(--faint)" }}
                      onClick={() => setForm({ ...form, aboutTags: tags.filter((_, i) => i !== idx) })}
                      aria-label={`Hapus ${tag}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              id="profile-tag-input"
              className="adm-input md:max-w-sm"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
            />
          </Field>
          <Field label="Kutipan" htmlFor="profile-quote" optional>
            <input {...text("quote")} />
          </Field>
        </section>

        <section className="adm-section space-y-4">
          <h2 className="adm-h2">Ajakan kontak</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Judul" htmlFor="profile-ctaHeadline">
              <input {...text("ctaHeadline")} />
            </Field>
            <Field label="Teks tombol" htmlFor="profile-ctaButtonText">
              <input {...text("ctaButtonText")} />
            </Field>
          </div>
          <Field label="Kalimat pendukung" htmlFor="profile-ctaSub">
            <textarea {...text("ctaSub")} rows={2} />
          </Field>
        </section>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3 mt-5">
        {status && (
          <p role="status" className="text-[13px] mr-auto" style={{ color: status.ok ? "var(--accent)" : "var(--danger)" }}>
            {status.text}
          </p>
        )}
        <button type="submit" className="adm-btn adm-btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan…" : "Simpan profil"}
        </button>
      </div>
    </form>
  );
}
