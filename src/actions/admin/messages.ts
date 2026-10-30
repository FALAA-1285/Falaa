"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { toggleMessageRead, deleteMessage } from "@/lib/db";
import { sanitizeActionError } from "@/lib/security";

export async function toggleMessageReadAction(
  id: number,
  isRead: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  try {
    const updated = await toggleMessageRead(id, isRead === true);
    if (!updated) {
      return { success: false, error: "Pesan tidak ditemukan." };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal mengubah status pesan.") };
  }
}

export async function deleteMessageAction(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  try {
    const deleted = await deleteMessage(id);
    if (!deleted) {
      return { success: false, error: "Pesan tidak ditemukan." };
    }
    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal menghapus pesan.") };
  }
}
