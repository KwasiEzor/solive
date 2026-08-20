"use server";
import { totpCodeSchema } from "@/lib/schemas/auth";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";
import { createSupabaseAdminClient } from "@/server/auth/supabase-admin";
import { generateRecoveryCodes } from "@/server/services/recovery-codes";
import { writeAudit } from "@/server/services/audit";

export type EnrollResult =
  | { status: "ok"; factorId: string; qrCode: string; secret: string }
  | { status: "error"; message: string };

export type ConfirmResult =
  | { status: "ok"; recoveryCodes: string[] }
  | { status: "error"; message: string };

/** Begin TOTP enrollment — returns the QR + secret to display once (SLV-041). */
export async function enrollTotpAction(): Promise<EnrollResult> {
  const supabase = await createSupabaseServerClient();

  // Clean up any half-finished enrolment: an unverified factor left by an
  // abandoned attempt collides on the friendly name and blocks a retry.
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.status === "unverified") {
      await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
  }

  const { data, error } = await supabase.auth.mfa.enroll({
    factorType: "totp",
    friendlyName: "Solive",
  });
  if (error || !data) {
    return { status: "error", message: "Impossible de démarrer l’enrôlement." };
  }
  return {
    status: "ok",
    factorId: data.id,
    qrCode: data.totp.qr_code,
    secret: data.totp.secret,
  };
}

/**
 * Confirm enrollment with a TOTP code. On success: generate 8 recovery codes,
 * store them Argon2id-hashed, stamp mfa_enrolled_at, and return the codes for a
 * one-time display (SLV-042).
 */
export async function confirmTotpEnrollAction(input: {
  factorId: string;
  code: string;
}): Promise<ConfirmResult> {
  const parsed = totpCodeSchema.safeParse(input.code);
  if (!parsed.success) {
    return { status: "error", message: "Code à 6 chiffres invalide." };
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: input.factorId,
    code: parsed.data,
  });
  if (error) return { status: "error", message: "Code invalide ou expiré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Session expirée." };

  const { codes, hashes } = await generateRecoveryCodes();
  const admin = createSupabaseAdminClient();
  const { error: insErr } = await admin
    .from("mfa_recovery_codes")
    .insert(hashes.map((h) => ({ user_id: user.id, code_hash: h })));
  if (insErr) {
    return { status: "error", message: "Échec de génération des codes." };
  }
  await admin
    .from("admin_users")
    .update({ mfa_enrolled_at: new Date().toISOString() })
    .eq("id", user.id);

  await writeAudit({
    actorId: user.id,
    action: "update",
    entityType: "mfa",
    entityId: user.id,
    diff: { enrolled: true },
  });
  return { status: "ok", recoveryCodes: codes };
}
