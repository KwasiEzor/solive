"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hashEmail, hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { loginSchema, totpCodeSchema } from "@/lib/schemas/auth";
import { env } from "@/lib/env";
import { writeAudit } from "@/server/services/audit";
import {
  getLoginThrottle,
  recordLoginAttempt,
} from "@/server/services/login-attempts";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

// Identical message for unknown email and wrong password (no enumeration, SLV-043).
const GENERIC_ERROR = "E-mail ou mot de passe incorrect.";

export type LoginResult =
  | { status: "ok" }
  | { status: "mfa_required" }
  | { status: "mfa_enroll" }
  | { status: "error"; message: string }
  | { status: "throttled"; retryAfterSec: number };

async function ipHashFromRequest(): Promise<{ ipHash: string; salt: string }> {
  const salt = env.IP_HASH_SALT ?? "dev-insecure-salt-please-set-IP_HASH_SALT";
  const ip = clientIpFromHeaders(await headers()) ?? "unknown";
  return { ipHash: hashIp(ip, salt), salt };
}

export async function loginAction(input: {
  email: string;
  password: string;
}): Promise<LoginResult> {
  const parsed = loginSchema
    .pick({ email: true, password: true })
    .safeParse(input);
  if (!parsed.success) return { status: "error", message: GENERIC_ERROR };
  const { email, password } = parsed.data;

  const { ipHash, salt } = await ipHashFromRequest();
  const emailHash = hashEmail(email, salt);

  const throttle = await getLoginThrottle({ emailHash, ipHash });
  if (!throttle.allowed) {
    return {
      status: "throttled",
      retryAfterSec: Math.ceil(throttle.retryAfterMs / 1000),
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    await recordLoginAttempt({ emailHash, ipHash, succeeded: false });
    return { status: "error", message: GENERIC_ERROR };
  }
  await recordLoginAttempt({ emailHash, ipHash, succeeded: true });

  // Must this session step up to aal2? (a verified TOTP factor exists)
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
    return { status: "mfa_required" };
  }

  // No verified factor: owner must enroll before reaching the admin (SLV-041).
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (adminRow?.role === "owner") return { status: "mfa_enroll" };

  await writeAudit({
    actorId: data.user.id,
    action: "login",
    entityType: "session",
    ipHash,
  });
  return { status: "ok" };
}

export async function verifyTotpAction(input: {
  code: string;
}): Promise<LoginResult> {
  const parsed = totpCodeSchema.safeParse(input.code);
  if (!parsed.success) {
    return { status: "error", message: "Code à 6 chiffres invalide." };
  }
  const supabase = await createSupabaseServerClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.find((f) => f.status === "verified");
  if (!factor) return { status: "error", message: "Aucun facteur MFA." };

  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId: factor.id,
    code: parsed.data,
  });
  if (error) return { status: "error", message: "Code invalide ou expiré." };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { ipHash } = await ipHashFromRequest();
  await writeAudit({
    actorId: user?.id ?? null,
    action: "login",
    entityType: "session",
    ipHash,
    diff: { mfa: true },
  });
  return { status: "ok" };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
}

/** Form-action variant: sign out (revoke session, SLV-044) then redirect. */
export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/connexion");
}
