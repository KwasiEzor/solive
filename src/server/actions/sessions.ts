"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/guards";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";
import { revokeUserSession } from "@/server/services/sessions";

/** Revoke one of the current admin's sessions (SLV-046). */
export async function revokeSessionAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const sessionId = String(formData.get("sessionId") ?? "");
  if (sessionId) await revokeUserSession(admin.userId, sessionId);
  revalidatePath("/admin/parametres");
}

/** Revoke every session except the current one. */
export async function revokeOtherSessionsAction(): Promise<void> {
  await requireAdmin();
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "others" });
  revalidatePath("/admin/parametres");
}
