import { randomBytes } from "node:crypto";
import { hash, verify } from "@node-rs/argon2";

/**
 * MFA recovery codes (SLV-042): 8 single-use codes, generated at enrollment,
 * stored hashed with Argon2id, shown to the user exactly once.
 */
export const RECOVERY_CODE_COUNT = 8;
const CODE_LENGTH = 10;
const ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789"; // 36, matches schema

// @node-rs/argon2 defaults to the Argon2id variant (verified in tests).
function randomCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

export interface GeneratedRecoveryCodes {
  /** Plaintext — display once, never persist. */
  codes: string[];
  /** Argon2id hashes — persist these. */
  hashes: string[];
}

export async function generateRecoveryCodes(): Promise<GeneratedRecoveryCodes> {
  const codes = Array.from({ length: RECOVERY_CODE_COUNT }, randomCode);
  const hashes = await Promise.all(codes.map((c) => hash(c)));
  return { codes, hashes };
}

/**
 * Returns the index of the matching stored hash, or -1. Callers must then
 * invalidate that single code (single-use). Normalise the input first with
 * recoveryCodeSchema.
 */
export async function verifyRecoveryCode(
  code: string,
  hashes: string[],
): Promise<number> {
  for (let i = 0; i < hashes.length; i++) {
    const h = hashes[i];
    if (!h) continue;
    try {
      if (await verify(h, code)) return i;
    } catch {
      // malformed stored hash — skip
    }
  }
  return -1;
}
