import { describe, expect, it } from "vitest";
import {
  emailSchema,
  enrollVerifySchema,
  inviteSchema,
  loginSchema,
  passwordSchema,
  recoveryCodeSchema,
  totpCodeSchema,
} from "@/lib/schemas/auth";

describe("auth schemas (SLV-004/040)", () => {
  it("normalises email to trimmed lowercase", () => {
    expect(emailSchema.parse("  Bonjour@Solive.BE ")).toBe("bonjour@solive.be");
  });

  it("rejects malformed email", () => {
    expect(emailSchema.safeParse("nope").success).toBe(false);
  });

  it("enforces a 12-char minimum password (SLV-040)", () => {
    expect(passwordSchema.safeParse("short").success).toBe(false);
    expect(passwordSchema.safeParse("abcdefghijkl").success).toBe(true);
  });

  it("accepts only 6-digit TOTP codes", () => {
    expect(totpCodeSchema.safeParse("123456").success).toBe(true);
    expect(totpCodeSchema.safeParse("12345").success).toBe(false);
    expect(totpCodeSchema.safeParse("abcdef").success).toBe(false);
  });

  it("login requires email + password, otp optional", () => {
    expect(
      loginSchema.safeParse({ email: "a@b.be", password: "x" }).success,
    ).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.be" }).success).toBe(false);
  });

  it("invite restricts role to owner|editor", () => {
    expect(
      inviteSchema.safeParse({ email: "a@b.be", role: "editor" }).success,
    ).toBe(true);
    expect(
      inviteSchema.safeParse({ email: "a@b.be", role: "admin" }).success,
    ).toBe(false);
  });

  it("enroll verify wants a 6-digit code", () => {
    expect(enrollVerifySchema.safeParse({ code: "000000" }).success).toBe(true);
    expect(enrollVerifySchema.safeParse({ code: "zzz" }).success).toBe(false);
  });

  it("recovery code strips separators and validates length", () => {
    expect(recoveryCodeSchema.parse("ab12-cd34-ef")).toBe("ab12cd34ef");
    expect(recoveryCodeSchema.safeParse("too-short").success).toBe(false);
  });
});
