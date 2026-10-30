import React, { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { getProjectById } from "@/lib/db";
import ProjectForm from "@/components/admin/ProjectForm";
import { requireAdminSession } from "@/lib/auth";

interface EditProjectPageProps {
  params: Promise<{ id: string }>;
}

async function EditProjectContent({ params }: EditProjectPageProps) {
  await requireAdminSession();
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    return (
      <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center max-w-lg mx-auto mt-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Project Tidak Ditemukan</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Data project dengan ID <code className="font-mono text-neutral-800 bg-neutral-100 px-1 py-0.5 rounded">{id}</code> tidak terdaftar di sistem.
          </p>
        </div>
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-black hover:bg-neutral-800 px-4 py-2 rounded-md transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Project</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Edit Project: {project.title}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Perbarui informasi, tags teknologi, poin fitur, atau media gambar project ini.
        </p>
      </div>

      <ProjectForm initialData={project} isEdit={true} />
    </div>
  );
}

export default function EditProjectPage(props: EditProjectPageProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center text-sm text-neutral-400">
          Memuat formulir edit project...
        </div>
      }
    >
      <EditProjectContent {...props} />
    </Suspense>
  );
}
