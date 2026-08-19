import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { RequestResetForm } from "@/components/admin/password-forms";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      subtitle="Nous vous enverrons un lien de réinitialisation sécurisé."
    >
      <RequestResetForm />
    </AuthShell>
  );
}
