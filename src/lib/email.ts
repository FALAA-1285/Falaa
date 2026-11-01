/**
 * Email Notification Service for new portfolio contact messages.
 * Uses Resend REST API (serverless-friendly, zero external npm dependencies).
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface ContactNotificationInput {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function sendContactNotificationEmail(
  msg: ContactNotificationInput
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const adminEmail =
    process.env.NOTIFICATION_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "ahmadfalahi1285@gmail.com";

  if (!apiKey) {
    // When RESEND_API_KEY is not configured yet, skip gracefully without throwing
    console.log(
      "[EMAIL NOTIFICATION SKIPPED] RESEND_API_KEY is not configured in environment variables."
    );
    return { success: false, error: "RESEND_API_KEY is not configured" };
  }

  const cleanSubject = msg.subject?.trim() || "Pesan dari Portofolio";
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #111827; }
    .card { max-width: 580px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    .header { background-color: #111827; color: #ffffff; padding: 24px 28px; }
    .header h1 { margin: 0; font-size: 18px; font-weight: 600; letter-spacing: -0.02em; }
    .header p { margin: 4px 0 0; font-size: 13px; color: #9ca3af; }
    .content { padding: 28px; }
    .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .meta-table td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f3f4f6; }
    .meta-table td.label { width: 90px; color: #6b7280; font-weight: 500; }
    .meta-table td.value { color: #111827; font-weight: 600; }
    .message-box { background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 18px; margin-bottom: 24px; }
    .message-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6b7280; margin: 0 0 10px; }
    .message-text { font-size: 14px; line-height: 1.6; color: #1f2937; margin: 0; white-space: pre-wrap; word-break: break-word; }
    .btn-action { display: inline-block; background-color: #111827; color: #ffffff !important; padding: 12px 24px; border-radius: 9999px; text-decoration: none; font-size: 14px; font-weight: 500; }
    .footer { padding: 16px 28px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Pesan Baru Masuk</h1>
      <p>Portofolio Website Notification</p>
    </div>
    <div class="content">
      <table class="meta-table">
        <tr>
          <td class="label">Pengirim</td>
          <td class="value">${escapeHtml(msg.name)}</td>
        </tr>
        <tr>
          <td class="label">Email</td>
          <td class="value"><a href="mailto:${encodeURIComponent(msg.email)}" style="color: #2563eb; text-decoration: none;">${escapeHtml(msg.email)}</a></td>
        </tr>
        <tr>
          <td class="label">Subjek</td>
          <td class="value">${escapeHtml(cleanSubject)}</td>
        </tr>
        <tr>
          <td class="label">Waktu</td>
          <td class="value">${escapeHtml(formattedDate)} WIB</td>
        </tr>
      </table>

      <div class="message-box">
        <div class="message-title">Isi Pesan:</div>
        <p class="message-text">${escapeHtml(msg.message)}</p>
      </div>

      <div style="text-align: center;">
        <a href="mailto:${encodeURIComponent(msg.email)}?subject=Re:%20${encodeURIComponent(cleanSubject)}" class="btn-action">
          Balas Email Pengirim
        </a>
      </div>
    </div>
    <div class="footer">
      Pesan ini dikirim secara otomatis oleh Portofolio Website Anda.
    </div>
  </div>
</body>
</html>
  `.trim();

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.RESEND_FROM_EMAIL ||
          "Portfolio <onboarding@resend.dev>",
        to: [adminEmail],
        reply_to: msg.email,
        subject: `[Pesan Baru Portofolio] ${msg.name}: ${cleanSubject}`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(
        `[EMAIL NOTIFICATION ERROR] Resend returned status ${response.status}: ${errText}`
      );
      return { success: false, error: errText };
    }

    console.log(
      `[EMAIL NOTIFICATION SUCCESS] Notification sent to ${adminEmail}`
    );
    return { success: true };
  } catch (error) {
    console.error("[EMAIL NOTIFICATION EXCEPTION]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown email error",
    };
  }
}
