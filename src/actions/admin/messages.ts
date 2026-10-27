"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth";
import { getMessages, toggleMessageRead, deleteMessage } from "@/lib/db";
import type { ContactMessage } from "@/types/portfolio";

export async function getMessagesAction(): Promise<ContactMessage[]> {
  const session = await getAdminSession();
  if (!session || session.role !== "ADMIN") {
    return [];
  }
  return await getMessages();
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
    const errorMsg = error instanceof Error ? error.message : "Gagal mengubah status pesan.";
    return { success: false, error: errorMsg };
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
    const errorMsg = error instanceof Error ? error.message : "Gagal menghapus pesan.";
    return { success: false, error: errorMsg };
  }
}
