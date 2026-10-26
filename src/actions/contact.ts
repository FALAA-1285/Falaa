"use server";

import { revalidatePath } from "next/cache";
import { createMessage } from "@/lib/db";

export async function sendContactMessageAction(formData: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!formData.name?.trim() || !formData.email?.trim() || !formData.message?.trim()) {
    return { success: false, error: "Nama, email, dan pesan wajib diisi." };
  }

  // Basic email pattern check
  if (!formData.email.includes("@") || !formData.email.includes(".")) {
    return { success: false, error: "Alamat email tidak valid." };
  }

  try {
    await createMessage({
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: formData.subject?.trim() || "Pesan dari Portofolio",
      message: formData.message.trim(),
    });

    revalidatePath("/admin");
    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating contact message:", error);
    return { success: false, error: "Gagal mengirim pesan. Silakan coba kembali nanti." };
  }
}
