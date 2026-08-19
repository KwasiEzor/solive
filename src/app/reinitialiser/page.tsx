import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { SetNewPasswordForm } from "@/components/admin/password-forms";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe",
  robots: { index: false, follow: false },
};

// Reachable only with the recovery session established by /auth/callback.
export default async function ResetPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/mot-de-passe-oublie");
  return (
    <AuthShell
      title="Nouveau mot de passe"
      subtitle="Choisissez un mot de passe fort. Toutes vos autres sessions seront déconnectées."
    >
      <SetNewPasswordForm />
    </AuthShell>
  );
}
