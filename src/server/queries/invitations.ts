import "server-only";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { invitations } from "../../../drizzle/schema";

export type InvitationState =
  | { state: "valid"; email: string; role: "owner" | "editor" }
  | { state: "accepted" }
  | { state: "expired" }
  | { state: "not_found" };

/**
 * Looks up an invitation by its raw (unhashed) token — only the hash is
 * stored (SLV-011). The token is 32 random bytes (64 hex chars): effectively
 * unguessable, so distinguishing "expired" from "already accepted" here does
 * not enable enumeration the way it would for e.g. password reset.
 */
export async function getInvitationStatus(
  rawToken: string,
): Promise<InvitationState> {
  if (!/^[0-9a-f]{64}$/.test(rawToken)) return { state: "not_found" };
  const tokenHash = createHash("sha256").update(rawToken).digest("hex");

  const db = getDb();
  const rows = await db
    .select()
    .from(invitations)
    .where(eq(invitations.tokenHash, tokenHash))
    .limit(1);
  const row = rows[0];
  if (!row) return { state: "not_found" };
  if (row.acceptedAt) return { state: "accepted" };
  if (row.expiresAt.getTime() < Date.now()) return { state: "expired" };
  return { state: "valid", email: row.email, role: row.role };
}
