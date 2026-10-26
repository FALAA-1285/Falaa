import React, { Suspense } from "react";
import { getExperiences } from "@/lib/db";
import ExperienceTable from "@/components/admin/ExperienceTable";

async function ExperiencesContent() {
  const experiences = await getExperiences();
  return <ExperienceTable initialExperiences={experiences} />;
}

export default function AdminExperiencesPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-xs text-neutral-400 font-medium">
          Memuat data riwayat pengalaman...
        </div>
      }
    >
      <ExperiencesContent />
    </Suspense>
  );
}
