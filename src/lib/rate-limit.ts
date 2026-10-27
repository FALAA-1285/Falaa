import { headers } from "next/headers";

interface RateLimitRecord {
  timestamps: number[];
}

interface RateLimiterOptions {
  windowMs: number; // Duration of window in milliseconds
  maxRequests: number; // Max allowed requests in that window
}

/**
 * In-memory rate limiter with automatic sliding window cleanup.
 * Designed for Next.js Server Actions and API route protections.
 */
class MemoryRateLimiter {
  private store = new Map<string, RateLimitRecord>();
  private lastCleanup = Date.now();

  /**
   * Periodically remove keys that have no timestamps within the max window
   */
  private cleanup(windowMs: number) {
    const now = Date.now();
    // Only run cleanup once every 60 seconds
    if (now - this.lastCleanup < 60_000) return;
    this.lastCleanup = now;

    const threshold = now - windowMs;
    for (const [key, record] of this.store.entries()) {
      record.timestamps = record.timestamps.filter((ts) => ts > threshold);
      if (record.timestamps.length === 0) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Check if a key is allowed or exceeded its rate limit.
   */
  public check(
    key: string,
    options: RateLimiterOptions
  ): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
    const now = Date.now();
    const threshold = now - options.windowMs;

    this.cleanup(options.windowMs);

    let record = this.store.get(key);
    if (!record) {
      record = { timestamps: [] };
      this.store.set(key, record);
    }

    // Filter out timestamps outside the active window
    record.timestamps = record.timestamps.filter((ts) => ts > threshold);

    if (record.timestamps.length >= options.maxRequests) {
      // Find oldest timestamp in current window to calculate retry after
      const oldest = record.timestamps[0] || threshold;
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((oldest + options.windowMs - now) / 1000)
      );
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds,
      };
    }

    record.timestamps.push(now);
    return {
      allowed: true,
      remaining: options.maxRequests - record.timestamps.length,
      retryAfterSeconds: 0,
    };
  }

  /**
   * Reset rate limit for a specific key (useful on successful admin login)
   */
  public reset(key: string): void {
    this.store.delete(key);
  }
}

// Global singleton to persist across Next.js module evaluations and serverless warm starts
const globalRateLimiter =
  (globalThis as unknown as { __rateLimiter?: MemoryRateLimiter }).__rateLimiter ||
  new MemoryRateLimiter();

// Always persist on globalThis so module reloads in production warm instances reuse memory
(globalThis as unknown as { __rateLimiter?: MemoryRateLimiter }).__rateLimiter =
  globalRateLimiter;

export const rateLimiter = globalRateLimiter;

function isValidIp(ip: string): boolean {
  if (!ip || ip.length > 45) return false;
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^[a-fA-F0-9:]+$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * Helper to safely extract client IP from Next.js server headers.
 * Defends against X-Forwarded-For spoofing by prioritizing verified reverse proxy headers
 * and validating IP format before returning.
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();

    // 1. Cloudflare connecting IP (tamper-proof when behind Cloudflare)
    const cfIp = headerList.get("cf-connecting-ip");
    if (cfIp && isValidIp(cfIp.trim())) {
      return cfIp.trim();
    }

    // 2. Vercel / Nginx real client IP
    const realIp = headerList.get("x-real-ip");
    if (realIp && isValidIp(realIp.trim())) {
      return realIp.trim();
    }

    // 3. X-Forwarded-For: Client IP is appended by proxies; validate hops safely
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      const hops = forwardedFor
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean);

      // The rightmost hop is appended by the nearest trusted edge proxy
      for (let i = hops.length - 1; i >= 0; i--) {
        if (isValidIp(hops[i])) {
          return hops[i];
        }
      }
    }
  } catch {
    // If called outside of request context (e.g. background tasks or unit tests)
  }
  return "127.0.0.1";
}
