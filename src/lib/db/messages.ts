import { pool } from "./pool";
import type { ContactMessage } from "@/types/portfolio";

export async function getMessages(
  limit: number = 100,
  offset: number = 0
): Promise<ContactMessage[]> {
  try {
    const safeLimit = Math.max(1, Math.min(limit, 500));
    const safeOffset = Math.max(0, offset);
    const { rows } = await pool.query(
      `SELECT id, name, email, subject, message, is_read, created_at
       FROM messages
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [safeLimit, safeOffset]
    );
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      subject: r.subject || undefined,
      message: r.message,
      is_read: r.is_read,
      created_at: r.created_at,
    }));
  } catch (error) {
    console.error("Error fetching messages from PostgreSQL:", error);
    return [];
  }
}

export async function createMessage(msg: {
  name: string;
  email: string;
  subject?: string;
  message: string;
}): Promise<ContactMessage> {
  const { rows } = await pool.query(
    `INSERT INTO messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, subject, message, is_read, created_at`,
    [msg.name, msg.email, msg.subject || "", msg.message]
  );
  return rows[0] as ContactMessage;
}

export async function toggleMessageRead(id: number, isRead: boolean): Promise<boolean> {
  const result = await pool.query(
    "UPDATE messages SET is_read = $1 WHERE id = $2",
    [isRead, id]
  );
  return (result.rowCount ?? 0) > 0;
}

export async function deleteMessage(id: number): Promise<boolean> {
  const result = await pool.query("DELETE FROM messages WHERE id = $1", [id]);
  return (result.rowCount ?? 0) > 0;
}
