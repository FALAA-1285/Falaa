import React, { Suspense } from "react";
import { getExperiences } from "@/lib/db";
import ExperienceTable from "@/components/admin/ExperienceTable";
import { requireAdminSession } from "@/lib/auth";

async function ExperiencesContent() {
  await requireAdminSession();
  const experiences = await getExperiences();
  return <ExperienceTable initialExperiences={experiences} />;
}

export default function AdminExperiencesPage() {
  return (
    <Suspense fallback={<p className="adm-meta">Memuat pengalaman…</p>}>
      <ExperiencesContent />
    </Suspense>
  );
}
