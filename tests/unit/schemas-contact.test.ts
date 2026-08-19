import { describe, expect, it } from "vitest";
import { contactSchema, isHumanTiming, MIN_ELAPSED_MS } from "@/lib/schemas/contact";

const base = {
  name: "Camille",
  email: "Camille@Entreprise.BE",
  message: "Un projet de site vitrine pour ma menuiserie.",
  clientId: "018f9b8e-7c2a-7e3a-9f1a-2b3c4d5e6f70",
  turnstileToken: "tok",
};

describe("contactSchema (SLV-030/055)", () => {
  it("accepts a valid submission and normalises email", () => {
    const r = contactSchema.parse(base);
    expect(r.email).toBe("camille@entreprise.be");
    expect(r.locale).toBe("fr");
    expect(r.projectTypes).toEqual([]);
  });

  it("rejects a short message", () => {
    expect(contactSchema.safeParse({ ...base, message: "court" }).success).toBe(
      false,
    );
  });

  it("rejects a filled honeypot (SLV-055)", () => {
    expect(
      contactSchema.safeParse({ ...base, website: "http://spam.example" }).success,
    ).toBe(false);
  });

  it("requires a turnstile token", () => {
    const { turnstileToken, ...rest } = base;
    void turnstileToken;
    expect(contactSchema.safeParse(rest).success).toBe(false);
  });

  it("requires a valid client UUID", () => {
    expect(contactSchema.safeParse({ ...base, clientId: "nope" }).success).toBe(
      false,
    );
  });
});

describe("isHumanTiming", () => {
  it("rejects sub-2s submissions, allows slower/undefined", () => {
    expect(isHumanTiming(500)).toBe(false);
    expect(isHumanTiming(MIN_ELAPSED_MS)).toBe(true);
    expect(isHumanTiming(undefined)).toBe(true);
  });
});
