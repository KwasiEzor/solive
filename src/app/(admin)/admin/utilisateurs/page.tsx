import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReauthGate } from "@/components/admin/reauth-gate";
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
        <h1 className="text-2xl font-extrabold tracking-tight">Utilisateurs</h1>
        <ReauthGate />
      </div>
    );
  }

  const [users, invites] = await Promise.all([
    getAdminUsers(),
    getPendingInvitations(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Utilisateurs</h1>

      {error && (
        <p role="alert" className="rounded border border-red-500 p-3 text-sm text-red-600">
          {ERRORS[error] ?? "Erreur."}
        </p>
      )}
      {invited && (
        <div className="rounded border border-acc p-3 text-sm">
          Invitation créée. Lien d’acceptation (à transmettre — l’envoi par
          e-mail arrive en phase 6, valable 72 h) :
          <code className="mt-1 block break-all font-mono text-xs">
            /invitation/{invited}
          </code>
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Inviter</h2>
        <form action={inviteUserAction} className="flex flex-wrap items-end gap-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium">
              Rôle
            </label>
            <select
              id="role"
              name="role"
              defaultValue="editor"
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2 text-sm"
            >
              <option value="editor">Éditeur</option>
              <option value="owner">Propriétaire</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded bg-acc px-3 py-2 text-sm font-semibold text-on-acc"
          >
            Envoyer l’invitation
          </button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Comptes</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left text-[var(--dim)]">
                <th className="py-2 pr-4 font-medium">E-mail</th>
                <th className="py-2 pr-4 font-medium">Rôle</th>
                <th className="py-2 pr-4 font-medium">État</th>
                <th className="py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--line2)]">
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">
                    <form action={changeRoleAction} className="flex items-center gap-1">
                      <input type="hidden" name="userId" value={u.id} />
                      <select
                        name="role"
                        defaultValue={u.role}
                        aria-label={`Rôle de ${u.email}`}
                        className="rounded border border-[var(--line)] bg-[var(--bg2)] px-2 py-1"
                      >
                        <option value="editor">Éditeur</option>
                        <option value="owner">Propriétaire</option>
                      </select>
                      <button type="submit" className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:border-acc">
                        OK
                      </button>
                    </form>
                  </td>
                  <td className="py-2 pr-4">
                    {u.disabledAt ? "Désactivé" : "Actif"}
                  </td>
                  <td className="py-2">
                    <form action={setUserDisabledAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="disable" value={u.disabledAt ? "0" : "1"} />
                      <button type="submit" className="rounded border border-[var(--line)] px-2 py-1 text-xs hover:border-acc">
                        {u.disabledAt ? "Réactiver" : "Désactiver"}
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-3 text-[var(--dim)]">
                    Aucun compte (exécutez <code>pnpm seed:owner</code>).
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {invites.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Invitations en attente</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {invites
              .filter((i) => !i.acceptedAt)
              .map((i) => (
                <li key={i.id} className="flex justify-between">
                  <span>
                    {i.email} · {i.role === "owner" ? "Propriétaire" : "Éditeur"}
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
