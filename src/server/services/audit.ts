import "server-only";
import { createSupabaseAdminClient } from "@/server/auth/supabase-admin";

/**
 * Audit logging (SLV-056): every admin mutation records who/what/when/from
 * where (hashed IP) with a before/after diff. Written via the service-role
 * client so the append-only audit_log is filled regardless of the actor's RLS.
 */
export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "publish"
  | "unpublish"
  | "restore"
  | "login"
  | "invite"
  | "role_change"
  | "reorder";

export interface AuditInput {
  actorId: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  diff?: unknown;
  ipHash?: string | null;
  userAgent?: string | null;
}

export async function writeAudit(entry: AuditInput): Promise<void> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("audit_log").insert({
    actor_id: entry.actorId,
    action: entry.action,
    entity_type: entry.entityType,
    entity_id: entry.entityId ?? null,
    diff: (entry.diff ?? null) as never,
    ip_hash: entry.ipHash ?? null,
    user_agent: entry.userAgent ?? null,
  });
  if (error) {
    // Audit must not silently vanish — surface for Sentry (Phase 9).
    throw new Error(`audit write failed: ${error.message}`);
  }
}
