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
    <Suspense fallback={<p className="adm-meta">Memuat project…</p>}>
      <ProjectList />
    </Suspense>
  );
}
