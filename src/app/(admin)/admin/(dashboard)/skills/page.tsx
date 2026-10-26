import React, { Suspense } from "react";
import { getSkills } from "@/lib/db";
import SkillTable from "@/components/admin/SkillTable";

async function SkillsContent() {
  const skills = await getSkills();
  return <SkillTable initialSkills={skills} />;
}

export default function AdminSkillsPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-xs text-neutral-400 font-medium">
          Memuat data technical skills dari PostgreSQL...
        </div>
      }
    >
      <SkillsContent />
    </Suspense>
  );
}
