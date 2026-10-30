import React, { Suspense } from "react";
import Link from "next/link";
import { getProjectById } from "@/lib/db";
import ProjectForm from "@/components/admin/ProjectForm";
import PageHead from "@/components/admin/PageHead";
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
      <>
        <PageHead title="Project tidak ditemukan" lede={`Tidak ada project dengan ID "${id}". Mungkin sudah dihapus.`} />
        <Link href="/admin/projects" className="adm-btn">
          Kembali ke daftar project
        </Link>
      </>
    );
  }

  return (
    <>
      <PageHead title={project.title} lede="Perubahan langsung tampil di situs setelah disimpan." />
      <ProjectForm initialData={project} isEdit={true} />
    </>
  );
}

export default function EditProjectPage(props: EditProjectPageProps) {
  return (
    <Suspense fallback={<p className="adm-meta">Memuat project…</p>}>
      <EditProjectContent {...props} />
    </Suspense>
  );
}
