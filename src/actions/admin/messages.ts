"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getMessages, toggleMessageRead, deleteMessage } from "@/lib/db";
import { sanitizeActionError } from "@/lib/security";
import type { ContactMessage } from "@/types/portfolio";

export async function getMessagesAction(
  limit: number = 100,
  offset: number = 0
): Promise<ContactMessage[]> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return [];
  }
  return await getMessages(limit, offset);
}

export async function toggleMessageReadAction(
  id: number,
  isRead: boolean
): Promise<{ success: boolean; error?: string }> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "Akses ditolak: Hanya ADMIN yang diizinkan." };
  }

  try {
    const success = await toggleMessageRead(id, isRead);
    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { success };
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
    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { success: deleted };
  } catch (error: unknown) {
    return { success: false, error: sanitizeActionError(error, "Gagal menghapus pesan.") };
  }
}
