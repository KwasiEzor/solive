/**
 * Progressive login rate limiting (SLV-043): 5 failed attempts per IP+email in
 * 15 minutes, then exponential backoff. Pure decision function over the recent
 * failed-attempt timestamps (read from login_attempts); the DB read/write live
 * in the login action. Error messaging is identical for unknown email and wrong
 * password (no account enumeration) — enforced at the action layer.
 */
export const THROTTLE_WINDOW_MS = 15 * 60 * 1000;
export const THROTTLE_LIMIT = 5;
const BASE_BACKOFF_MS = 60 * 1000; // 1 min
const MAX_BACKOFF_MS = 60 * 60 * 1000; // 1 h

export interface ThrottleDecision {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * @param failedAt timestamps (ms) of recent FAILED attempts for this ip+email
 * @param now current time (ms)
 */
export function evaluateLoginThrottle(
  failedAt: number[],
  now: number,
): ThrottleDecision {
  const windowStart = now - THROTTLE_WINDOW_MS;
  const inWindow = failedAt.filter((t) => t >= windowStart).sort((a, b) => a - b);
  const failures = inWindow.length;

  if (failures < THROTTLE_LIMIT) {
    return { allowed: true, remaining: THROTTLE_LIMIT - failures, retryAfterMs: 0 };
  }

  // Exponential backoff past the limit, measured from the last failure.
  const over = failures - THROTTLE_LIMIT;
  const backoff = Math.min(BASE_BACKOFF_MS * 2 ** over, MAX_BACKOFF_MS);
  const last = inWindow[inWindow.length - 1] ?? now;
  const retryAfterMs = Math.max(0, last + backoff - now);

  return {
    allowed: retryAfterMs === 0,
    remaining: 0,
    retryAfterMs,
  };
}
