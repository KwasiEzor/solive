import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env } from "@/lib/env";

/**
 * Contact rate limiting (SLV-055): 3 requests per IP per hour, 10 per day.
 * Backed by Upstash Redis (provisioned via Vercel, KV_* env). If unconfigured
 * (local dev without keys) it fails open — Turnstile + honeypot + timing still
 * gate the endpoint.
 */
let limiters: { hourly: Ratelimit; daily: Ratelimit } | null | undefined;

function getLimiters() {
  if (limiters !== undefined) return limiters;
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    limiters = null;
    return null;
  }
  const redis = new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
  });
  limiters = {
    hourly: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "1 h"),
      prefix: "contact:h",
    }),
    daily: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, "1 d"),
      prefix: "contact:d",
    }),
  };
  return limiters;
}

export interface RateDecision {
  allowed: boolean;
  retryAfterSec?: number;
}

export async function checkContactRateLimit(
  identifier: string,
): Promise<RateDecision> {
  const l = getLimiters();
  if (!l) return { allowed: true };

  const [hour, day] = await Promise.all([
    l.hourly.limit(identifier),
    l.daily.limit(identifier),
  ]);

  if (hour.success && day.success) return { allowed: true };

  const reset = Math.max(
    hour.success ? 0 : hour.reset,
    day.success ? 0 : day.reset,
  );
  return {
    allowed: false,
    retryAfterSec: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
  };
}
