import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentAdmin } from "@/server/auth/guards";
import { getDashboardStats } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Tableau de bord",
  robots: { index: false, follow: false },
};

const ACTION_LABEL: Record<string, string> = {
  create: "création",
  update: "modification",
  delete: "suppression",
  publish: "publication",
  unpublish: "dépublication",
  restore: "restauration",
  login: "connexion",
  invite: "invitation",
  role_change: "changement de rôle",
  reorder: "réordonnancement",
};

function fmt(ts: Date | string) {
  return new Date(ts).toLocaleString("fr-BE", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default async function AdminDashboard() {
  const admin = await getCurrentAdmin();
  const stats = await getDashboardStats();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Tableau de bord
        </h1>
        <p className="text-sm text-[var(--dim)]">
          Connecté : {admin.ok ? admin.value.email : ""}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/demandes"
          className="rounded border border-[var(--line)] bg-[var(--bg2)] p-5 hover:border-acc"
        >
          <p className="text-3xl font-extrabold text-acc">{stats.newLeads}</p>
          <p className="text-sm text-[var(--dim)]">Demandes non traitées</p>
        </Link>
        <Link
          href="/admin/contenu/hero"
          className="rounded border border-[var(--line)] bg-[var(--bg2)] p-5 hover:border-acc"
        >
          <p className="text-3xl font-extrabold text-acc">{stats.drafts}</p>
          <p className="text-sm text-[var(--dim)]">Sections en brouillon</p>
        </Link>
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Dernières demandes</h2>
          <ul className="flex flex-col divide-y divide-[var(--line2)] text-sm">
            {stats.recentLeads.map((l) => (
              <li key={l.id} className="flex items-center justify-between py-2">
                <Link href={`/admin/demandes/${l.id}`} className="hover:text-acc">
                  {l.name} — {l.email}
                </Link>
                <span className="text-[var(--dim)]">{fmt(l.createdAt)}</span>
              </li>
            ))}
            {stats.recentLeads.length === 0 && (
              <li className="py-2 text-[var(--dim)]">Aucune demande.</li>
            )}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-bold">Dernières modifications</h2>
          <ul className="flex flex-col divide-y divide-[var(--line2)] text-sm">
            {stats.recentChanges.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <span>
                  {ACTION_LABEL[a.action] ?? a.action} · {a.entityType}
                </span>
                <span className="text-[var(--dim)]">{fmt(a.createdAt)}</span>
              </li>
            ))}
            {stats.recentChanges.length === 0 && (
              <li className="py-2 text-[var(--dim)]">Aucune activité.</li>
            )}
          </ul>
        </div>
      </section>
    </div>
  );
}
