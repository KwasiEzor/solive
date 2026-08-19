"use server";
import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

const REAUTH_COOKIE = "solive_reauth";
const REAUTH_MAX_AGE_MS = 5 * 60 * 1000;

/**
 * Re-authenticate before sensitive operations (SLV-047): email change, MFA
 * disable, invitations, permanent deletion. Verifies the current password and
 * stamps a short-lived reauth cookie that guards check.
 */
export async function reauthenticateAction(input: {
  password: string;
}): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { status: "error", message: "Session expirée." };

  const { error } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: input.password,
  });
  if (error) return { status: "error", message: "Mot de passe incorrect." };

  const store = await cookies();
  store.set(REAUTH_COOKIE, String(Date.now()), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: REAUTH_MAX_AGE_MS / 1000,
  });
  return { status: "ok" };
}
