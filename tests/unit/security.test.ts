import { describe, expect, it } from "vitest";
import { isSameOrigin } from "@/lib/csrf";
import { hashEmail, hashIp, saltedHash } from "@/lib/hash";
import {
  contentSecurityPolicy,
  generateNonce,
  securityHeaders,
} from "@/lib/security-headers";

describe("saltedHash (SLV-125)", () => {
  it("is deterministic per salt and never returns the input", () => {
    const a = hashIp("203.0.113.4", "salt-1");
    const b = hashIp("203.0.113.4", "salt-1");
    expect(a).toBe(b);
    expect(a).not.toContain("203.0.113.4");
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it("changes with the salt", () => {
    expect(hashIp("203.0.113.4", "salt-1")).not.toBe(
      hashIp("203.0.113.4", "salt-2"),
    );
  });

  it("namespaces ip vs email", () => {
    expect(hashIp("x", "s")).not.toBe(hashEmail("x", "s"));
    expect(saltedHash("A@B.be ", "s")).toBe(saltedHash("a@b.be", "s"));
  });
});

describe("security headers (SLV-051)", () => {
  it("CSP nonces scripts, keeps script-src free of unsafe-inline", () => {
    const csp = contentSecurityPolicy("NONCE123");
    const scriptSrc = csp
      .split(";")
      .map((d) => d.trim())
      .find((d) => d.startsWith("script-src"))!;
    expect(scriptSrc).toContain("'nonce-NONCE123'");
    expect(scriptSrc).not.toContain("unsafe-inline"); // scripts stay strict
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("emits the full hardening set", () => {
    const h = securityHeaders("n");
    expect(h["Strict-Transport-Security"]).toContain("preload");
    expect(h["X-Content-Type-Options"]).toBe("nosniff");
    expect(h["X-Frame-Options"]).toBe("DENY");
    expect(h["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(h["Permissions-Policy"]).toContain("geolocation=()");
  });

  it("nonce is unique and base64", () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[A-Za-z0-9+/]+=*$/);
  });
});

describe("isSameOrigin (SLV-052)", () => {
  it("allows safe methods without origin", () => {
    expect(isSameOrigin({ method: "GET", origin: null, host: "solive.pro" })).toBe(true);
  });

  it("accepts matching origin/host on POST", () => {
    expect(
      isSameOrigin({
        method: "POST",
        origin: "https://solive.pro",
        host: "solive.pro",
      }),
    ).toBe(true);
  });

  it("rejects cross-origin and missing origin on POST", () => {
    expect(
      isSameOrigin({
        method: "POST",
        origin: "https://evil.example",
        host: "solive.pro",
      }),
    ).toBe(false);
    expect(isSameOrigin({ method: "POST", origin: null, host: "solive.pro" })).toBe(
      false,
    );
  });
});
