import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default function ConnexionPage() {
  return (
    <AuthShell title="Connexion" subtitle="Accédez à votre espace d’administration.">
      <LoginForm />
    </AuthShell>
  );
}
