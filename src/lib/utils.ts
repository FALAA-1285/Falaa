import { createSafeMailtoUrl } from "./security";

/**
 * Simple class name combiner utility
 */
export function cn(...inputs: (string | boolean | undefined | null)[]): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Format email mailto URL safely preventing CRLF or malicious scheme injections
 */
export function createMailtoUrl(email: string, subject?: string, body?: string): string {
  return createSafeMailtoUrl(email, subject, body);
}
