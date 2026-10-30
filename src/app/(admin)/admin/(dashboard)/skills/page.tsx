import React, { Suspense } from "react";
import { getSkills } from "@/lib/db";
import SkillTable from "@/components/admin/SkillTable";
import { requireAdminSession } from "@/lib/auth";

async function SkillsContent() {
  await requireAdminSession();
  const skills = await getSkills();
  return <SkillTable initialSkills={skills} />;
}

export default function AdminSkillsPage() {
  return (
    <Suspense fallback={<p className="adm-meta">Memuat skill…</p>}>
      <SkillsContent />
    </Suspense>
  );
}
