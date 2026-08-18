import { describe, expect, it } from "vitest";
import { clientIpFromHeaders } from "@/lib/request-ip";

function headers(map: Record<string, string>) {
  return { get: (n: string) => map[n.toLowerCase()] ?? null };
}

describe("clientIpFromHeaders", () => {
  it("takes the left-most x-forwarded-for entry", () => {
    expect(
      clientIpFromHeaders(headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" })),
    ).toBe("203.0.113.9");
  });

  it("falls back to x-real-ip", () => {
    expect(clientIpFromHeaders(headers({ "x-real-ip": "198.51.100.2" }))).toBe(
      "198.51.100.2",
    );
  });

  it("returns null when absent", () => {
    expect(clientIpFromHeaders(headers({}))).toBeNull();
  });
});
