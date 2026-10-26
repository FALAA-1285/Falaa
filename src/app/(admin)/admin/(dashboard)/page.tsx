import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderKanban,
  Briefcase,
  Layers,
  Mail,
  Plus,
  ArrowRight,
  ExternalLink,
  UserCheck,
  Database,
  CheckCircle2,
} from "lucide-react";
import { getProjects, getExperiences, getSkills, getMessages } from "@/lib/db";

async function DashboardContent() {
  const [projects, experiences, skills, messages] = await Promise.all([
    getProjects(),
    getExperiences(),
    getSkills(),
    getMessages(),
  ]);

  const unreadMessagesCount = messages.filter((m) => !m.is_read).length;
  const recentProjects = projects.slice(0, 4);
  const recentMessages = messages.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Top Monochrome Hero Banner with Vector Silhouettes */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {/* Black Geometric Silhouette Art Watermark */}
        <div className="absolute right-0 top-0 bottom-0 w-80 pointer-events-none opacity-5 flex items-center justify-end pr-6">
          <svg className="w-72 h-72 text-black fill-current" viewBox="0 0 200 200">
            <polygon points="100,10 190,190 10,190" />
            <circle cx="100" cy="110" r="50" fill="white" />
            <rect x="75" y="85" width="50" height="50" fill="black" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-[11px] font-bold text-neutral-800 tracking-wider uppercase mb-2">
              <Database className="w-3 h-3 text-black" />
              <span>PostgreSQL Engine Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              FALAH Portfolio CMS
            </h2>
            <p className="text-sm text-neutral-500 mt-1.5 max-w-2xl leading-relaxed">
              Sistem manajemen konten monokrom berbasis PostgreSQL. Kelola project, riwayat pengalaman, keahlian teknis, biodata profil, dan pesan kontak secara terpusat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/projects/new"
              className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-xs active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </Link>
            <Link
              href="/admin/experiences"
              className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold px-4 py-2.5 rounded-xl border border-neutral-300 transition"
            >
              <Briefcase className="w-4 h-4 text-black" />
              <span>Experiences</span>
            </Link>
            <Link
              href="/admin/skills"
              className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold px-4 py-2.5 rounded-xl border border-neutral-300 transition"
            >
              <Layers className="w-4 h-4 text-black" />
              <span>Skills</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid - High Contrast Monochrome */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Projects */}
        <Link
          href="/admin/projects"
          className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs hover:border-black/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Total Projects
            </span>
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
            {projects.length}
          </div>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-medium">
            <span>Showcase portofolio aktif</span>
            <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* 2. Experiences */}
        <Link
          href="/admin/experiences"
          className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs hover:border-black/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Experiences
            </span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
            {experiences.length}
          </div>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-medium">
            <span>Riwayat karir & akademik</span>
            <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* 3. Skills */}
        <Link
          href="/admin/skills"
          className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs hover:border-black/50 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Technical Skills
            </span>
            <div className="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
            {skills.length}
          </div>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-medium">
            <span>Tech stack & tools</span>
            <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>

        {/* 4. Messages */}
        <Link
          href="/admin/messages"
          className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-xs hover:border-black/50 transition-all group relative overflow-hidden"
        >
          {unreadMessagesCount > 0 && (
            <div className="absolute top-2 right-2 px-2 py-0.5 bg-black text-white rounded-full text-[10px] font-bold">
              {unreadMessagesCount} Baru
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Inbox Pesan
            </span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 text-black border border-neutral-300 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold text-neutral-900 font-mono tracking-tight">
            {messages.length}
          </div>
          <p className="text-xs text-neutral-400 mt-1 flex items-center gap-1 font-medium">
            <span>{unreadMessagesCount} belum dibaca</span>
            <ArrowRight className="w-3 h-3 text-neutral-400 group-hover:translate-x-1 transition-transform" />
          </p>
        </Link>
      </div>

      {/* Two Column Layout: Recent Projects + Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Projects Table Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200 shadow-xs p-6">
          <div className="flex items-center justify-between border-b border-neutral-200/80 pb-4 mb-4">
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Project Showcase Terbaru
              </h3>
              <p className="text-xs text-neutral-500 font-medium">
                Daftar karya yang tampil di portofolio publik
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-bold text-neutral-800 hover:text-black flex items-center gap-1 bg-neutral-100 hover:bg-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-200 transition"
            >
              <span>Lihat Semua ({projects.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentProjects.length === 0 ? (
            <div className="py-12 text-center text-neutral-400">
              <FolderKanban className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
              <p className="text-xs font-medium">Belum ada project yang tersimpan.</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="py-3 flex items-center justify-between gap-4 hover:bg-neutral-50/80 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="relative w-12 h-10 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover"
                        unoptimized={project.image.endsWith(".svg")}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                        {project.title}
                      </h4>
                      <p className="text-xs text-neutral-500 truncate">
                        {project.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[11px] font-semibold bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-md border border-neutral-200 hidden sm:inline-block">
                      {project.category}
                    </span>
                    <Link
                      href={`/admin/projects/${project.id}/edit`}
                      className="text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-black hover:text-white px-3 py-1.5 rounded-lg border border-neutral-300 transition"
                    >
                      Edit
                    </Link>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-neutral-400 hover:text-black transition"
                        title="Lihat URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right (1 col): Quick Navigation & Recent Messages */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5">
            <h3 className="text-sm font-bold text-neutral-900 mb-3 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-black" />
              <span>Aksi Cepat CRUD</span>
            </h3>
            <div className="space-y-2">
              <Link
                href="/admin/projects/new"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5 text-black" /> Tambah Project Baru
                </span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/admin/experiences"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-black" /> Kelola Pengalaman
                </span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/admin/skills"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-black" /> Kelola Skills
                </span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
              </Link>
              <Link
                href="/admin/profile"
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs font-bold text-neutral-800 transition"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-3.5 h-3.5 text-black" /> Edit Profil & Bio
                </span>
                <ArrowRight className="w-3 h-3 text-neutral-400" />
              </Link>
            </div>
          </div>

          {/* Recent Messages Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-black" />
                <span>Pesan Masuk Terbaru</span>
              </h3>
              <Link
                href="/admin/messages"
                className="text-[11px] font-bold text-neutral-600 hover:text-black"
              >
                Inbox ({messages.length})
              </Link>
            </div>

            {recentMessages.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">
                Belum ada pesan masuk.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-neutral-900 truncate">
                        {msg.name}
                      </span>
                      {!msg.is_read ? (
                        <span className="px-1.5 py-0.5 rounded bg-black text-white text-[9px] font-bold">
                          Baru
                        </span>
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-neutral-400" />
                      )}
                    </div>
                    <p className="text-neutral-500 text-[11px] line-clamp-1">
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-sm text-neutral-400 font-medium">
          Memuat ringkasan dashboard CMS...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
