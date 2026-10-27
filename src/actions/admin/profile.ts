"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { invalidatePortfolioCache } from "@/lib/cached-data";
import { getProfileInfo, updateProfileInfo } from "@/lib/db";
import { profileSchema } from "@/lib/schemas/profile";
import { sanitizeUrl } from "@/lib/security";
import type { PersonalInfo } from "@/types/portfolio";

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

  const parsed = profileSchema.safeParse(data);
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Validasi data profil gagal.";
    return { success: false, error: errorMsg };
  }

  try {
    const sanitizedData: PersonalInfo = {
      ...parsed.data,
      linkedin: sanitizeUrl(parsed.data.linkedin, ""),
      github: sanitizeUrl(parsed.data.github, ""),
      institution: parsed.data.institution || "",
      location: parsed.data.location || "",
      quote: parsed.data.quote || "",
      aboutSub: parsed.data.aboutSub || "",
      aboutHeadline: parsed.data.aboutHeadline || "",
      aboutTags: parsed.data.aboutTags || [],
      ctaHeadline: parsed.data.ctaHeadline || "",
      ctaSub: parsed.data.ctaSub || "",
      ctaButtonText: parsed.data.ctaButtonText || "",
    };

    const updated = await updateProfileInfo(sanitizedData);
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/profile");
    invalidatePortfolioCache();
    return { success: true, profile: updated };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Gagal memperbarui profil.";
    return { success: false, error: errorMsg };
  }
}
