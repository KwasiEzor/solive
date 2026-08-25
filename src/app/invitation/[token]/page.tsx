import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/admin/auth-shell";
import { InvitationAcceptForm } from "@/components/admin/invitation-accept-form";
import { getInvitationStatus } from "@/server/queries/invitations";

export const metadata: Metadata = {
  title: "Accepter l’invitation",
  robots: { index: false, follow: false },
};

const STATUS_COPY = {
  accepted: {
    icon: CheckCircle2,
    title: "Invitation déjà utilisée",
    text: "Ce compte a déjà été créé. Connectez-vous avec vos identifiants.",
  },
  expired: {
    icon: AlertTriangle,
    title: "Invitation expirée",
    text: "Ce lien n’est plus valable (72 h de validité). Demandez au propriétaire de vous en envoyer une nouvelle.",
  },
  not_found: {
    icon: XCircle,
    title: "Invitation introuvable",
    text: "Ce lien est invalide ou a été révoqué. Vérifiez que vous avez copié l’adresse en entier.",
  },
} as const;

type Params = { params: Promise<{ token: string }> };

export default async function InvitationPage({ params }: Params) {
  const { token } = await params;
  const status = await getInvitationStatus(token);

  if (status.state !== "valid") {
    const copy = STATUS_COPY[status.state];
    const Icon = copy.icon;
    return (
      <AuthShell title="Invitation">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg2)] p-4">
            <Icon size={20} className="mt-0.5 flex-none text-acc" />
            <div>
              <p className="font-semibold">{copy.title}</p>
              <p className="mt-1 text-sm text-[var(--dim)]">{copy.text}</p>
            </div>
          </div>
          <Link href="/connexion" className="auth-btn text-center">
            Aller à la connexion
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Rejoindre Solive"
      subtitle="Créez votre mot de passe pour activer votre compte."
    >
      <InvitationAcceptForm token={token} email={status.email} role={status.role} />
    </AuthShell>
  );
}
