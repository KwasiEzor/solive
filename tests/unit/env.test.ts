import { describe, expect, it } from "vitest";
import { EnvValidationError, parseEnv } from "@/lib/env";

describe("parseEnv (SLV-057)", () => {
  it("accepts a valid environment", () => {
    const env = parseEnv({
      NODE_ENV: "test",
      NEXT_PUBLIC_SITE_URL: "https://solive.pro",
    });
    expect(env.NEXT_PUBLIC_SITE_URL).toBe("https://solive.pro");
    expect(env.NODE_ENV).toBe("test");
  });

  it("defaults NODE_ENV to development", () => {
    const env = parseEnv({ NEXT_PUBLIC_SITE_URL: "https://solive.pro" });
    expect(env.NODE_ENV).toBe("development");
  });

  it("throws when a required var is missing", () => {
    expect(() => parseEnv({ NODE_ENV: "production" })).toThrowError(
      EnvValidationError,
    );
  });

  it("throws when a required var is malformed", () => {
    expect(() =>
      parseEnv({ NEXT_PUBLIC_SITE_URL: "not-a-url" }),
    ).toThrowError(EnvValidationError);
  });

  it("treats an empty optional var as unset", () => {
    const env = parseEnv({
      NEXT_PUBLIC_SITE_URL: "https://solive.pro",
      KV_REST_API_URL: "",
    });
    expect(env.KV_REST_API_URL).toBeUndefined();
  });

  it("treats an empty required var as missing", () => {
    expect(() => parseEnv({ NEXT_PUBLIC_SITE_URL: "" })).toThrowError(
      EnvValidationError,
    );
  });

  it("rejects an invalid optional URL when provided", () => {
    expect(() =>
      parseEnv({
        NEXT_PUBLIC_SITE_URL: "https://solive.pro",
        KV_REST_API_URL: "nope",
      }),
    ).toThrowError(EnvValidationError);
  });
});
