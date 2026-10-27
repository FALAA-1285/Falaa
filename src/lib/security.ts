/**
 * Security utilities for URL validation, sanitization, and Stored XSS prevention.
 * Implements strict allowlist-based URL protocol verification.
 */

export const ALLOWED_WEB_PROTOCOLS = new Set(["http:", "https:"]);

const DANGEROUS_PATTERNS = [
  /javascript\s*:/i,
  /data\s*:/i,
  /vbscript\s*:/i,
  /blob\s*:/i,
  /file\s*:/i,
];

/**
 * Remove ASCII control characters (0-31 and 127) and whitespace that attackers
 * might use to bypass naive protocol filters (e.g. "jav\x00ascript:").
 */
export function stripControlAndWhitespace(str: string): string {
  // Remove control characters (ASCII 00-1F, 7F)
  return str.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

/**
 * Validates whether a URL string uses a strictly permitted web protocol (http: or https:).
 * Rejects javascript:, data:, vbscript:, blob:, file:, and malformed URIs.
 */
export function isSafeUrl(url: unknown, allowedProtocols = ALLOWED_WEB_PROTOCOLS): boolean {
  if (typeof url !== "string") return false;

  const cleaned = stripControlAndWhitespace(url);
  if (!cleaned) return false;

  // Immediate check against known dangerous schemes
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(cleaned)) {
      return false;
    }
  }

  // Prevent protocol-relative URLs that start with "//"
  if (cleaned.startsWith("//") || cleaned.startsWith("/\\") || cleaned.startsWith("\\\\")) {
    return false;
  }

  // Ensure protocol is followed by exactly two slashes and a valid host character (e.g. rejects http:///foo)
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\/[^\s/\\@]/i.test(cleaned)) {
    return false;
  }

  try {
    const parsed = new URL(cleaned);
    // Protocol must strictly match allowlist
    if (!allowedProtocols.has(parsed.protocol.toLowerCase())) {
      return false;
    }

    // Must have a valid hostname (reject missing host)
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Permitted image file extensions for internal relative paths.
 */
const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".svg",
  ".avif",
  ".ico",
]);

/**
 * Validates whether an image URL is safe for rendering.
 * Permitted formats:
 * 1. Safe relative internal paths: starts with single "/", followed by alphanumeric/dashes/underscores/dots,
 *    no directory traversal (".."), and ends with an allowed image extension or is in /uploads/ or /projects/.
 * 2. Safe absolute URLs starting with http: or https:.
 */
export function isSafeImageUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;

  const cleaned = stripControlAndWhitespace(url);
  if (!cleaned) return false;

  // Check for dangerous schemes
  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(cleaned)) {
      return false;
    }
  }

  // Case 1: Internal relative path
  if (cleaned.startsWith("/")) {
    // Disallow protocol-relative URLs (//)
    if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) {
      return false;
    }

    // Disallow directory traversal
    if (cleaned.includes("..")) {
      return false;
    }

    // Must contain only safe URL path characters
    if (!/^\/[a-zA-Z0-9_\-\.\/]+$/.test(cleaned)) {
      return false;
    }

    // Check extension
    const dotIndex = cleaned.lastIndexOf(".");
    if (dotIndex !== -1) {
      const ext = cleaned.substring(dotIndex).toLowerCase();
      return ALLOWED_IMAGE_EXTENSIONS.has(ext);
    }

    return false;
  }

  // Case 2: External absolute URL
  return isSafeUrl(cleaned);
}

/**
 * Sanitizes an external URL. If safe, returns the cleaned URL;
 * otherwise returns an empty string or the provided fallback.
 */
export function sanitizeUrl(url: unknown, fallback = ""): string {
  if (typeof url !== "string") return fallback;
  const cleaned = stripControlAndWhitespace(url);
  return isSafeUrl(cleaned) ? cleaned : fallback;
}

/**
 * Sanitizes an image URL for safe rendering.
 */
export function sanitizeImageUrl(url: unknown, fallback = "/projects/project-1.svg"): string {
  if (typeof url !== "string") return fallback;
  const cleaned = stripControlAndWhitespace(url);
  return isSafeImageUrl(cleaned) ? cleaned : fallback;
}

/**
 * Validates whether an email address is strictly formed and free of CRLF header injection.
 */
export function isSafeEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed || trimmed.length > 254) return false;

  // Reject newline, carriage return, tabs, colon, quotes, semicolons, angle brackets
  if (/[\r\n\t:"<>\\;]/.test(trimmed)) {
    return false;
  }

  // Basic RFC 5322 compliant regex for practical email matching
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(trimmed);
}

/**
 * Creates a safe `mailto:` link, safely encoding subject and body parameters
 * and guaranteeing that the recipient email is clean and contains no injection payloads.
 */
export function createSafeMailtoUrl(
  email: unknown,
  subject?: string,
  body?: string
): string {
  if (typeof email !== "string" || !isSafeEmail(email)) {
    return "#";
  }

  const cleanEmail = email.trim();
  const params = new URLSearchParams();
  if (subject) params.append("subject", subject);
  if (body) params.append("body", body);

  const queryString = params.toString();
  return `mailto:${cleanEmail}${queryString ? `?${queryString}` : ""}`;
}
