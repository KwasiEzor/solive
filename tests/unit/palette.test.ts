import { describe, expect, it } from "vitest";
import { isPalette, PALETTES } from "@/lib/palette";

describe("isPalette", () => {
  it.each(PALETTES)("accepts %s", (p) => {
    expect(isPalette(p)).toBe(true);
  });

  it("rejects an unknown value", () => {
    expect(isPalette("nord")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isPalette("")).toBe(false);
  });
});
