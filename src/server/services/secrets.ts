import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

/**
 * Encryption at rest for the third-party credentials configurable from
 * /admin/agent-ia (SLV, agent settings) — the one documented exception to
 * "secrets live only in env vars" (src/lib/env.ts): these are product
 * credentials meant to be editable without a redeploy, not infra secrets.
 *
 * AES-256-GCM via node:crypto. Blob format: base64(iv(12) + authTag(16) +
 * ciphertext). Never logged, never round-tripped to the client — only the
 * last 4 characters of the plaintext are ever stored/displayed separately
 * for admin verification (see agent_settings.*_last4 columns).
 */

function key(): Buffer {
  const raw = env.SETTINGS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY is not set — generate one with `openssl rand -base64 32` and add it to .env.local / Vercel.",
    );
  }
  const buf = Buffer.from(raw, "base64");
  if (buf.length !== 32) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY must decode to exactly 32 bytes (openssl rand -base64 32).",
    );
  }
  return buf;
}

export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptSecret(blob: string): string {
  const raw = Buffer.from(blob, "base64");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const enc = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/** Whether encryption is usable right now — gates the admin credentials form. */
export function secretsConfigured(): boolean {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}
