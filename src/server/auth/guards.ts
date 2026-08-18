import "server-only";
import { err, ok, type Result } from "@/lib/result";
import { createSupabaseServerClient } from "./supabase-server";

/**
 * Server-side auth guards (SLV-050). The middleware guard is not enough — every
 * Server Action re-checks here. Reads run under RLS (admin can read own row).
 */
export interface AuthedAdmin {
  userId: string;
  email: string;
  role: "owner" | "editor";
}

export type AuthError = "unauthenticated" | "forbidden";

export async function getCurrentAdmin(): Promise<Result<AuthedAdmin, AuthError>> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return err("unauthenticated");

  const { data, error } = await supabase
    .from("admin_users")
    .select("role, email, disabled_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data || data.disabled_at) return err("forbidden");
  return ok({ userId: user.id, email: data.email, role: data.role });
}

export async function requireAdmin(): Promise<AuthedAdmin> {
  const result = await getCurrentAdmin();
  if (!result.ok) throw new Error(result.error);
  return result.value;
}

export async function requireOwner(): Promise<AuthedAdmin> {
  const admin = await requireAdmin();
  if (admin.role !== "owner") throw new Error("forbidden");
  return admin;
}
