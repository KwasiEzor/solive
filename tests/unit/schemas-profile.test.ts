import { describe, expect, it } from "vitest";
import { profileSchema } from "@/lib/schemas/profile";

describe("profileSchema", () => {
  it("accepts a valid full name, trimmed", () => {
    const parsed = profileSchema.safeParse({ fullName: "  Camille Dupont  " });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.fullName).toBe("Camille Dupont");
  });

  it("rejects an empty name", () => {
    expect(profileSchema.safeParse({ fullName: "" }).success).toBe(false);
  });

  it("rejects a name over 120 characters", () => {
    expect(profileSchema.safeParse({ fullName: "a".repeat(121) }).success).toBe(false);
  });
});
