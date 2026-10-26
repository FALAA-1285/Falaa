import React from "react";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
          Tambah Project Baru
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Isi detail data karya di bawah ini. Data yang disimpan akan langsung tampil di website portofolio utama.
        </p>
      </div>

      <ProjectForm isEdit={false} />
    </div>
  );
}
