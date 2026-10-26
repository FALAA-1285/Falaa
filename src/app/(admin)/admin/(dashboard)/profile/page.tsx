import React, { Suspense } from "react";
import { getProfileInfo } from "@/lib/db";
import ProfileForm from "@/components/admin/ProfileForm";

async function ProfileContent() {
  const profile = await getProfileInfo();
  return <ProfileForm initialProfile={profile} />;
}

export default function AdminProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white rounded-2xl border border-neutral-200 p-8 text-center text-xs text-neutral-400 font-medium">
          Memuat data profil...
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
