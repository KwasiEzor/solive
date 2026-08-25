import { Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Badge, type BadgeTone, PageHeader } from "@/components/admin/ui";
import { getLeads } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Demandes",
  robots: { index: false, follow: false },
};

const STATUSES = ["new", "contacted", "quoted", "won", "lost"] as const;
const LABEL: Record<string, string> = {
  new: "Nouvelle",
  contacted: "Contactée",
  quoted: "Devis",
  won: "Gagnée",
  lost: "Perdue",
};
const TONE: Record<string, BadgeTone> = {
  new: "blue",
  contacted: "amber",
  quoted: "blue",
  won: "green",
  lost: "red",
};

type Search = { searchParams: Promise<{ status?: string }> };

export default async function DemandesPage({ searchParams }: Search) {
  const { status } = await searchParams;
  const active = STATUSES.includes(status as (typeof STATUSES)[number])
    ? (status as (typeof STATUSES)[number])
    : undefined;
  const rows = await getLeads(active);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Demandes"
        description="Les leads reçus via le formulaire de contact."
      >
        {/* Route handler returning a CSV download — not a page navigation. */}
        <a href="/admin/demandes/export" download className="adm-btn adm-btn-ghost">
          <Download size={16} /> Export CSV
        </a>
      </PageHeader>

      <nav
        className="flex flex-wrap gap-2 text-sm"
        aria-label="Filtrer par statut"
      >
        <Link
          href="/admin/demandes"
          className={
            "rounded-full border px-3.5 py-1.5 transition-colors " +
            (!active
              ? "border-acc bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] text-acc"
              : "border-[var(--line)] text-[var(--dim)] hover:border-acc")
          }
        >
          Toutes
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/demandes?status=${s}`}
            className={
              "rounded-full border px-3.5 py-1.5 transition-colors " +
              (active === s
                ? "border-acc bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] text-acc"
                : "border-[var(--line)] text-[var(--dim)] hover:border-acc")
            }
          >
            {LABEL[s]}
          </Link>
        ))}
      </nav>

      <div className="adm-card overflow-x-auto">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Statut</th>
              <th>Reçue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td>
                  <Link
                    href={`/admin/demandes/${l.id}`}
                    className="font-medium hover:text-acc"
                  >
                    {l.name}
                  </Link>
                </td>
                <td className="text-[var(--dim)]">{l.email}</td>
                <td>
                  <Badge tone={TONE[l.status] ?? "neutral"}>
                    {LABEL[l.status] ?? l.status}
                  </Badge>
                </td>
                <td className="text-[var(--dim)]">
                  {new Date(l.createdAt).toLocaleDateString("fr-BE")}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="text-[var(--dim)]">
                  Aucune demande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
