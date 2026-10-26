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

// Global singleton to persist across Next.js module evaluations
const globalRateLimiter =
  (globalThis as unknown as { __rateLimiter?: MemoryRateLimiter }).__rateLimiter ||
  new MemoryRateLimiter();

if (process.env.NODE_ENV !== "production") {
  (globalThis as unknown as { __rateLimiter?: MemoryRateLimiter }).__rateLimiter =
    globalRateLimiter;
}

export const rateLimiter = globalRateLimiter;

/**
 * Helper to safely extract client IP from Next.js server headers
 */
export async function getClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const forwardedFor = headerList.get("x-forwarded-for");
    if (forwardedFor) {
      return forwardedFor.split(",")[0].trim();
    }
    const realIp = headerList.get("x-real-ip");
    if (realIp) {
      return realIp.trim();
    }
  } catch {
    // If called outside of request context
  }
  return "127.0.0.1";
}
