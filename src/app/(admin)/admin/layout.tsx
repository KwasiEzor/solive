import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminLocale } from "@/lib/i18n/admin-locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getCurrentAdmin } from "@/server/auth/guards";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

/**
 * Admin guard (SLV-050) — server-side, on every request. Never trusts client
 * state; Server Actions re-check independently. Enforces the MFA enrollment
 * gate (SLV-041): an owner without MFA can only reach /mfa.
 */
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const result = await getCurrentAdmin();
  if (!result.ok) redirect("/connexion");

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("admin_users")
    .select("mfa_enrolled_at, role")
    .eq("id", result.value.userId)
    .maybeSingle();
  if (data && data.role === "owner" && !data.mfa_enrolled_at) {
    redirect("/mfa");
  }

  const locale = await getAdminLocale();
  const t = getDictionary(locale).admin;

  return (
    <AdminShell
      email={result.value.email ?? ""}
      role={data?.role ?? "editor"}
      locale={locale}
      t={t}
    >
      {children}
    </AdminShell>
  );
}
