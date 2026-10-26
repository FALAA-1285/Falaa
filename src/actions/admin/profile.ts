"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getProfileInfo, updateProfileInfo } from "@/lib/db";
import { PersonalInfo } from "@/types/portfolio";

export async function getProfileInfoAction(): Promise<PersonalInfo> {
  return await getProfileInfo();
}

export async function updateProfileInfoAction(
  data: PersonalInfo
): Promise<{ success: boolean; profile?: PersonalInfo; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  if (!data.name || !data.email || !data.title) {
    return { success: false, error: "Nama, email, dan title wajib diisi." };
  }

  try {
    const updated = await updateProfileInfo(data);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/profile");
    return { success: true, profile: updated };
  } catch (error: any) {
    return { success: false, error: error?.message || "Gagal memperbarui profil." };
  }
}
