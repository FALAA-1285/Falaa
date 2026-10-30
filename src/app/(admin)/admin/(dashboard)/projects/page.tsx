import React, { Suspense } from "react";
import { getProjects } from "@/lib/db";
import ProjectTable from "@/components/admin/ProjectTable";
import { requireAdminSession } from "@/lib/auth";

async function ProjectList() {
  await requireAdminSession();
  const projects = await getProjects();
  return <ProjectTable initialProjects={projects} />;
}

export default function AdminProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-neutral-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Manajemen Project
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Kelola, tambah, edit, atau hapus item karya yang tampil di portofolio publik.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-xs text-neutral-400 font-medium">
            Memuat daftar data project...
          </div>
        }
      >
        <ProjectList />
      </Suspense>
    </div>
  );
}
