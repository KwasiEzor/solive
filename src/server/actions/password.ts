"use server";
import { headers } from "next/headers";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import {
  passwordResetRequestSchema,
  passwordSchema,
} from "@/lib/schemas/auth";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";
import { isPasswordPwned } from "@/server/services/hibp";
import { writeAudit } from "@/server/services/audit";

export type ActionResult =
  | { status: "ok" }
  | { status: "error"; message: string };

/**
 * Request a password reset (SLV-045). Always returns a generic success — never
 * reveals whether the email exists (no enumeration). Supabase sends the signed,
 * single-use link and the notification email.
 */
export async function requestPasswordResetAction(input: {
  email: string;
}): Promise<ActionResult> {
  const parsed = passwordResetRequestSchema.safeParse(input);
  if (!parsed.success) return { status: "error", message: "E-mail invalide." };

  const supabase = await createSupabaseServerClient();
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=%2Freinitialiser`,
  });
  return { status: "ok" };
}

/**
 * Set a new password from the recovery session (SLV-045). Enforces the 12-char
 * + HIBP policy (SLV-040), then revokes ALL other active sessions.
 */
export async function updatePasswordAction(input: {
  password: string;
}): Promise<ActionResult> {
  const parsed = passwordSchema.safeParse(input.password);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Le mot de passe doit contenir au moins 12 caractères.",
    };
  }

  const pwned = await isPasswordPwned(parsed.data);
  if (pwned.ok && pwned.value) {
    return {
      status: "error",
      message:
        "Ce mot de passe figure dans une fuite de données connue. Choisissez-en un autre.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Lien expiré ou invalide." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { status: "error", message: "Échec de la réinitialisation." };

  // Invalidate every other active session (SLV-045).
  await supabase.auth.signOut({ scope: "others" });

  const ipHash = hashIp(
    clientIpFromHeaders(await headers()) ?? "unknown",
    env.IP_HASH_SALT ?? "dev-insecure-salt",
  );
  await writeAudit({
    actorId: user.id,
    action: "update",
    entityType: "password",
    entityId: user.id,
    ipHash,
    diff: { reset: true },
  });
  return { status: "ok" };
}
