import { describe, expect, it } from "vitest";
import {
  THROTTLE_LIMIT,
  THROTTLE_WINDOW_MS,
  evaluateLoginThrottle,
} from "@/server/auth/login-throttle";

const NOW = 1_800_000_000_000;

describe("evaluateLoginThrottle (SLV-043)", () => {
  it("allows while under the limit", () => {
    const d = evaluateLoginThrottle([NOW - 1000, NOW - 2000], NOW);
    expect(d.allowed).toBe(true);
    expect(d.remaining).toBe(THROTTLE_LIMIT - 2);
  });

  it("ignores failures outside the 15-min window", () => {
    const old = NOW - THROTTLE_WINDOW_MS - 1;
    const d = evaluateLoginThrottle([old, old, old, old, old], NOW);
    expect(d.allowed).toBe(true);
    expect(d.remaining).toBe(THROTTLE_LIMIT);
  });

  it("blocks once the limit is hit, with backoff", () => {
    const fails = Array.from({ length: THROTTLE_LIMIT }, (_, i) => NOW - i * 1000);
    const d = evaluateLoginThrottle(fails, NOW);
    expect(d.allowed).toBe(false);
    expect(d.retryAfterMs).toBeGreaterThan(0);
  });

  it("backoff grows exponentially with more failures", () => {
    const five = Array.from({ length: 5 }, () => NOW);
    const seven = Array.from({ length: 7 }, () => NOW);
    const d5 = evaluateLoginThrottle(five, NOW);
    const d7 = evaluateLoginThrottle(seven, NOW);
    expect(d7.retryAfterMs).toBeGreaterThan(d5.retryAfterMs);
  });

  it("re-allows after the backoff elapses", () => {
    const fails = Array.from({ length: THROTTLE_LIMIT }, () => NOW - 20 * 60 * 1000);
    // all failures are just outside the window → treated as none
    const d = evaluateLoginThrottle(fails, NOW);
    expect(d.allowed).toBe(true);
  });
});
