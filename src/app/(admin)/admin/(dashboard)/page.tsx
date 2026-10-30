import React, { Suspense } from "react";
import Link from "next/link";
import {
  getProjects,
  getExperiences,
  getSkills,
  getMessages,
  getProfileInfo,
  countUnreadMessages,
} from "@/lib/db";
import { pool } from "@/lib/db/pool";
import { requireAdminSession } from "@/lib/auth";
import { formatShortDate } from "@/components/admin/format";

async function DashboardContent() {
  await requireAdminSession();

  let isDbConnected = true;
  try {
    await pool.query("SELECT 1");
  } catch {
    isDbConnected = false;
  }

  const [projects, experiences, skills, messages, profile, unreadCount] = await Promise.all([
    getProjects(),
    getExperiences(),
    getSkills(),
    getMessages(20),
    getProfileInfo(),
    countUnreadMessages(),
  ]);

  const unread = messages.filter((m) => !m.is_read);
  const shownMessages = (unread.length > 0 ? unread : messages).slice(0, 5);
  const skillCategories = new Set(skills.map((s) => s.category)).size;

  const contentRows = [
    {
      href: "/admin/projects",
      label: "Project",
      detail: `${projects.length} project ditampilkan`,
    },
    {
      href: "/admin/experiences",
      label: "Pengalaman",
      detail: `${experiences.length} entri riwayat`,
    },
    {
      href: "/admin/skills",
      label: "Skill",
      detail: `${skills.length} skill dalam ${skillCategories} kategori`,
    },
    {
      href: "/admin/profile",
      label: "Profil",
      detail: profile.title,
    },
  ];

  return (
    <div className="space-y-10">
      {!isDbConnected && (
        <div className="adm-notice adm-notice-error">
          Database tidak terhubung. Situs publik memakai data cadangan dan perubahan belum bisa
          disimpan sampai koneksi pulih.
        </div>
      )}

      <section>
        <h1 className="text-[26px] leading-tight font-semibold tracking-tight max-w-[28ch]">
          {unreadCount > 0
            ? `${unreadCount} pesan belum dibaca.`
            : "Tidak ada pesan baru."}
        </h1>
        <p className="adm-lede mt-1">
          {unreadCount > 0
            ? "Dikirim lewat formulir kontak di situs."
            : messages.length > 0
              ? "Ini pesan terakhir yang masuk."
              : "Pesan dari formulir kontak akan muncul di sini."}
        </p>

        {shownMessages.length > 0 && (
          <div className="adm-panel mt-5">
            {shownMessages.map((msg) => (
              <Link
                key={msg.id}
                href={`/admin/messages?m=${msg.id}`}
                className="adm-row hover:bg-(--paper) transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={msg.is_read ? "" : "font-semibold"}>{msg.name}</span>
                    <span className="adm-faint truncate">{msg.email}</span>
                  </div>
                  <p className="adm-meta truncate">{msg.subject || msg.message}</p>
                </div>
                <span className="adm-faint shrink-0">{formatShortDate(msg.created_at)}</span>
              </Link>
            ))}
            <div className="adm-row">
              <Link href="/admin/messages" className="text-[13px] font-medium" style={{ color: "var(--accent)" }}>
                Buka semua pesan
              </Link>
            </div>
          </div>
        )}
      </section>

      <section>
        <div className="adm-page-head mb-3">
          <h2 className="adm-h2">Isi portofolio</h2>
          <Link href="/admin/projects/new" className="adm-btn adm-btn-primary">
            Tambah project
          </Link>
        </div>
        <div className="adm-panel">
          {contentRows.map((row) => (
            <Link
              key={row.href}
              href={row.href}
              className="adm-row hover:bg-(--paper) transition-colors"
            >
              <span className="w-28 shrink-0 font-medium">{row.label}</span>
              <span className="adm-meta truncate flex-1">{row.detail}</span>
              <span className="text-[13px] shrink-0" style={{ color: "var(--accent)" }}>
                Kelola
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<p className="adm-meta">Memuat ringkasan…</p>}>
      <DashboardContent />
    </Suspense>
  );
}
