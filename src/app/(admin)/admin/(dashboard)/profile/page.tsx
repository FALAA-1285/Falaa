import React, { Suspense } from "react";
import { getProfileInfo } from "@/lib/db";
import ProfileForm from "@/components/admin/ProfileForm";
import { requireAdminSession } from "@/lib/auth";

async function ProfileContent() {
  await requireAdminSession();
  const profile = await getProfileInfo();
  return <ProfileForm initialProfile={profile} />;
}

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<p className="adm-meta">Memuat profil…</p>}>
      <ProfileContent />
    </Suspense>
  );
}
