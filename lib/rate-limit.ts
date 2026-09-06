import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { configuredValue, hasConfiguredValues } from "@/lib/env";

let limiter: Ratelimit | null = null;

function getLimiter() {
  if (limiter) return limiter;
  if (!hasConfiguredValues("UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN")) return null;
  const redis = new Redis({ url: configuredValue("UPSTASH_REDIS_REST_URL"), token: configuredValue("UPSTASH_REDIS_REST_TOKEN") });
  limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 m"), analytics: true, prefix: "pf:inquiry" });
  return limiter;
}

export async function enforceInquiryRateLimit(identifier: string) {
  const unavailable = { success: false, limit: 0, remaining: 0, reset: Date.now() + 60_000, configurationError: true };
  try {
    const rateLimiter = getLimiter();
    if (!rateLimiter) {
      if (process.env.NODE_ENV === "production") return unavailable;
      return { success: true, limit: 5, remaining: 5, reset: Date.now() + 600_000, configurationError: false };
    }
    const result = await rateLimiter.limit(identifier);
    return { ...result, configurationError: false };
  } catch (error) {
    console.error(JSON.stringify({ level: "error", event: "rate_limit_unavailable", error: error instanceof Error ? error.name : "UnknownError" }));
    return unavailable;
  }
}
