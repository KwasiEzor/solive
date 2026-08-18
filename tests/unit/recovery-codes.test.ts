import { describe, expect, it } from "vitest";
import {
  RECOVERY_CODE_COUNT,
  generateRecoveryCodes,
  verifyRecoveryCode,
} from "@/server/services/recovery-codes";

describe("recovery codes (SLV-042)", () => {
  it("generates 8 codes with matching hashes", async () => {
    const { codes, hashes } = await generateRecoveryCodes();
    expect(codes).toHaveLength(RECOVERY_CODE_COUNT);
    expect(hashes).toHaveLength(RECOVERY_CODE_COUNT);
    for (const c of codes) expect(c).toMatch(/^[a-z0-9]{10}$/);
    // hashes are Argon2id, not plaintext
    for (const h of hashes) expect(h.startsWith("$argon2id$")).toBe(true);
  });

  it("verifies a valid code and reports its index", async () => {
    const { codes, hashes } = await generateRecoveryCodes();
    const idx = await verifyRecoveryCode(codes[2]!, hashes);
    expect(idx).toBe(2);
  });

  it("rejects an unknown code", async () => {
    const { hashes } = await generateRecoveryCodes();
    expect(await verifyRecoveryCode("zzzzzzzzzz", hashes)).toBe(-1);
  });
}, 20_000);
