/**
 * Simple class name combiner utility
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format email mailto URL
 */
export function createMailtoUrl(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.append("subject", subject);
  if (body) params.append("body", body);
  const queryString = params.toString();
  return `mailto:${email}${queryString ? `?${queryString}` : ""}`;
}
