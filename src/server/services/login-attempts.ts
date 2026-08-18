import "server-only";
import { createSupabaseAdminClient } from "@/server/auth/supabase-admin";
import {
  THROTTLE_WINDOW_MS,
  evaluateLoginThrottle,
  type ThrottleDecision,
} from "@/server/auth/login-throttle";

/**
 * login_attempts persistence + throttle evaluation (SLV-043). Written via the
 * service-role client (the table has no anon policy). IP/email are pre-hashed
 * by the caller (SLV-125) — never stored in clear.
 */
export async function recordLoginAttempt(input: {
  emailHash: string;
  ipHash: string;
  succeeded: boolean;
}): Promise<void> {
  const admin = createSupabaseAdminClient();
  await admin.from("login_attempts").insert({
    email_hash: input.emailHash,
    ip_hash: input.ipHash,
    succeeded: input.succeeded,
  });
}

export async function getLoginThrottle(input: {
  emailHash: string;
  ipHash: string;
  now?: number;
}): Promise<ThrottleDecision> {
  const now = input.now ?? Date.now();
  const since = new Date(now - THROTTLE_WINDOW_MS).toISOString();
  const admin = createSupabaseAdminClient();
  const { data } = await admin
    .from("login_attempts")
    .select("created_at")
    .eq("succeeded", false)
    .gte("created_at", since)
    .or(`email_hash.eq.${input.emailHash},ip_hash.eq.${input.ipHash}`);

  const failedAt = (data ?? []).map((r) => new Date(r.created_at).getTime());
  return evaluateLoginThrottle(failedAt, now);
}
