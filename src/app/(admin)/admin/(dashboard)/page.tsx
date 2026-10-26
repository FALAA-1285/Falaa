import React, { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FolderKanban,
  Globe,
  Smartphone,
  Cpu,
  Plus,
  ArrowRight,
  ExternalLink,
  Layers,
} from "lucide-react";
import { getProjects } from "@/lib/db";

async function DashboardContent() {
  const projects = await getProjects();

  const webCount = projects.filter((p) => p.category === "Web & Fullstack").length;
  const mobileCount = projects.filter((p) => p.category === "Mobile").length;
  const mlCount = projects.filter(
    (p) => p.category === "Machine Learning & Tools"
  ).length;

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Overview Dashboard
          </span>
          <h2 className="text-2xl font-bold text-neutral-900 mt-1">
            Selamat Datang di FALAH CMS
          </h2>
          <p className="text-sm text-neutral-500 mt-1 max-w-xl">
            Pusat kendali internal untuk memanajemen konten portofolio, menambah showcase karya baru, dan mengelola media aset secara mandiri.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Project</span>
          </Link>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            <span>Kelola Data</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Total Project
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-neutral-900 font-mono">
            {projects.length}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Semua kategori karya</p>
        </div>

        {/* Web & Fullstack */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Web & Fullstack
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Globe className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-neutral-900 font-mono">
            {webCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Platform web aktif</p>
        </div>

        {/* Mobile */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Mobile Apps
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-neutral-900 font-mono">
            {mobileCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Aplikasi Flutter / Native</p>
        </div>

        {/* Machine Learning */}
        <div className="bg-white p-5 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              ML & Automation
            </span>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-800">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-3xl font-bold text-neutral-900 font-mono">
            {mlCount}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Computer vision & models</p>
        </div>
      </div>

      {/* Recent Projects Section */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-6">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 mb-4">
          <div>
            <h3 className="text-base font-semibold text-neutral-900">
              Daftar Project Terbaru
            </h3>
            <p className="text-xs text-neutral-500">
              Project yang baru ditambahkan atau diperbarui di portofolio
            </p>
          </div>
          <Link
            href="/admin/projects"
            className="text-xs font-medium text-neutral-700 hover:text-black flex items-center gap-1 transition"
          >
            <span>Lihat Semua ({projects.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentProjects.length === 0 ? (
          <div className="py-12 text-center text-neutral-400">
            <Layers className="w-8 h-8 mx-auto text-neutral-300 stroke-[1.5] mb-2" />
            <p className="text-sm">Belum ada project yang tersimpan.</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="py-3 flex items-center justify-between gap-4 hover:bg-neutral-50/50 px-2 rounded-lg transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-9 rounded bg-neutral-100 border border-neutral-200 overflow-hidden flex-shrink-0">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover"
                      unoptimized={project.image.endsWith(".svg")}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-neutral-900 truncate">
                      {project.title}
                    </h4>
                    <p className="text-xs text-neutral-500 truncate">
                      {project.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs bg-neutral-100 text-neutral-700 px-2.5 py-0.5 rounded-full border border-neutral-200 hidden sm:inline-block">
                    {project.category}
                  </span>
                  <Link
                    href={`/admin/projects/${project.id}/edit`}
                    className="text-xs font-medium text-neutral-600 hover:text-black px-2.5 py-1 rounded bg-neutral-100 hover:bg-neutral-200 transition"
                  >
                    Edit
                  </Link>
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 text-neutral-400 hover:text-black transition"
                      title="Buka link"
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
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-sm text-neutral-400">
          Memuat ringkasan dashboard CMS...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
