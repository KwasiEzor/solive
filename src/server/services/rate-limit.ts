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

/**
 * Analytics collector limit (SLV-140): best-effort cap per IP to keep the
 * cookieless beacon from being flooded. Generous — it only stops abuse.
 */
let collectLimiter: Ratelimit | null | undefined;

function getCollectLimiter() {
  if (collectLimiter !== undefined) return collectLimiter;
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    collectLimiter = null;
    return null;
  }
  collectLimiter = new Ratelimit({
    redis: new Redis({ url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN }),
    limiter: Ratelimit.slidingWindow(120, "1 m"),
    prefix: "collect",
  });
  return collectLimiter;
}

export async function checkCollectRateLimit(
  identifier: string,
): Promise<boolean> {
  const l = getCollectLimiter();
  if (!l) return true;
  const r = await l.limit(identifier);
  return r.success;
}

/**
 * AI qualification chat (SLV, agent). More generous than the contact form —
 * a real conversation sends several messages — but bounded against
 * abuse/cost blowout. Same fail-open behavior when Upstash isn't configured.
 */
let agentChatLimiters: { window: Ratelimit; daily: Ratelimit } | null | undefined;

function getAgentChatLimiters() {
  if (agentChatLimiters !== undefined) return agentChatLimiters;
  if (!env.KV_REST_API_URL || !env.KV_REST_API_TOKEN) {
    agentChatLimiters = null;
    return null;
  }
  const redis = new Redis({
    url: env.KV_REST_API_URL,
    token: env.KV_REST_API_TOKEN,
  });
  agentChatLimiters = {
    window: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(20, "10 m"),
      prefix: "agent-chat:w",
    }),
    daily: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(80, "1 d"),
      prefix: "agent-chat:d",
    }),
  };
  return agentChatLimiters;
}

export async function checkAgentChatRateLimit(
  identifier: string,
): Promise<RateDecision> {
  const l = getAgentChatLimiters();
  if (!l) return { allowed: true };

  const [window, day] = await Promise.all([
    l.window.limit(identifier),
    l.daily.limit(identifier),
  ]);

  if (window.success && day.success) return { allowed: true };

  const reset = Math.max(
    window.success ? 0 : window.reset,
    day.success ? 0 : day.reset,
  );
  return {
    allowed: false,
    retryAfterSec: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
  };
}
