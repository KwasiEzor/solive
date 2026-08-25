import { UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReauthGate } from "@/components/admin/reauth-gate";
import { Badge, PageHeader } from "@/components/admin/ui";
import {
  changeRoleAction,
  inviteUserAction,
  setUserDisabledAction,
} from "@/server/actions/users";
import { getCurrentAdmin, hasRecentReauth } from "@/server/auth/guards";
import { getAdminUsers, getPendingInvitations } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Utilisateurs",
  robots: { index: false, follow: false },
};

type Search = {
  searchParams: Promise<{ invited?: string; error?: string }>;
};

const ERRORS: Record<string, string> = {
  last_owner: "Impossible : il doit rester au moins un propriétaire actif.",
  invalid: "Données invalides.",
};

export default async function UsersPage({ searchParams }: Search) {
  const admin = await getCurrentAdmin();
  if (!admin.ok) redirect("/connexion");
  if (admin.value.role !== "owner") redirect("/admin");

  const { invited, error } = await searchParams;

  // Sensitive area — require a recent reauth (SLV-047).
  if (!(await hasRecentReauth())) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Utilisateurs" />
        <ReauthGate />
      </div>
    );
  }

  const [users, invites] = await Promise.all([
    getAdminUsers(),
    getPendingInvitations(),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Utilisateurs"
        description="Comptes d’administration, rôles et invitations."
      />

      {error && (
        <p
          role="alert"
          className="adm-card adm-card-p border-red-500/50 text-sm text-red-500"
        >
          {ERRORS[error] ?? "Erreur."}
        </p>
      )}
      {invited && (
        <div className="adm-card adm-card-p text-sm">
          Invitation créée. Lien d’acceptation à transmettre (valable 72 h) :
          <code className="mt-1 block break-all font-mono text-xs text-acc">
            /invitation/{invited}
          </code>
        </div>
      )}

      <section className="adm-card adm-card-p flex flex-col gap-3">
        <h2 className="font-bold">Inviter un utilisateur</h2>
        <form action={inviteUserAction} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-xs font-medium text-[var(--dim)]">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="adm-input"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-xs font-medium text-[var(--dim)]">
              Rôle
            </label>
            <select id="role" name="role" defaultValue="editor" className="adm-select">
              <option value="editor">Éditeur</option>
              <option value="owner">Propriétaire</option>
            </select>
          </div>
          <button type="submit" className="adm-btn adm-btn-primary">
            <UserPlus size={16} /> Envoyer l’invitation
          </button>
        </form>
      </section>

      <section className="adm-card flex flex-col">
        <h2 className="px-5 pt-5 font-bold">Comptes</h2>
        <div className="overflow-x-auto">
          <table className="adm-table mt-3">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Rôle</th>
                <th>État</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="font-medium">{u.email}</td>
                  <td>
                    <form
                      action={changeRoleAction}
                      className="flex items-center gap-1.5"
                    >
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        aria-label={`Rôle de ${u.email}`}
                        className="adm-select py-1.5 text-xs"
                      >
                        <option value="editor">Éditeur</option>
                        <option value="owner">Propriétaire</option>
                      </select>
                      <button type="submit" className="adm-icon-btn px-3 text-xs">
                        OK
                      </button>
                    </form>
                  </td>
                  <td>
                    <Badge tone={u.disabledAt ? "red" : "green"}>
                      {u.disabledAt ? "Désactivé" : "Actif"}
                    </Badge>
                  </td>
                  <td className="text-right">
                    <form action={setUserDisabledAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input
                        type="hidden"
                        name="disable"
                        value={u.disabledAt ? "0" : "1"}
                      />
                      <button type="submit" className="adm-icon-btn px-3 text-xs">
                        {u.disabledAt ? "Réactiver" : "Désactiver"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-[var(--dim)]">
                    Aucun compte (exécutez <code>pnpm seed:owner</code>).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {invites.filter((i) => !i.acceptedAt).length > 0 && (
        <section className="adm-card adm-card-p flex flex-col gap-3">
          <h2 className="font-bold">Invitations en attente</h2>
          <ul className="flex flex-col divide-y divide-[var(--line2)] text-sm">
            {invites
              .filter((i) => !i.acceptedAt)
              .map((i) => (
                <li key={i.id} className="flex justify-between py-2">
                  <span>
                    {i.email}{" "}
                    <Badge tone={i.role === "owner" ? "amber" : "neutral"}>
                      {i.role === "owner" ? "Propriétaire" : "Éditeur"}
                    </Badge>
                  </span>
                  <span className="text-[var(--dim)]">
                    expire {new Date(i.expiresAt).toLocaleDateString("fr-BE")}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
