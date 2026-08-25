import { CheckCircle2 } from "lucide-react";
import type { Metadata } from "next";
import { AuthShell } from "@/components/admin/auth-shell";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  robots: { index: false, follow: false },
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const { reset } = await searchParams;
  return (
    <AuthShell title="Connexion" subtitle="Accédez à votre espace d’administration.">
      {reset === "1" && (
        <div
          role="status"
          className="mb-1 flex items-center gap-2.5 rounded-xl border border-[var(--line)] bg-[var(--bg2)] px-4 py-3 text-sm"
        >
          <CheckCircle2 size={17} className="flex-none text-acc" />
          Mot de passe mis à jour. Connectez-vous avec vos nouveaux identifiants.
        </div>
      )}
      <LoginForm />
    </AuthShell>
  );
}
