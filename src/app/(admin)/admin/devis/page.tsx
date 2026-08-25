import type { Metadata } from "next";
import Link from "next/link";
import { Badge, type BadgeTone, PageHeader } from "@/components/admin/ui";
import { formatCentsEUR } from "@/lib/money";
import { getQuotes } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Devis",
  robots: { index: false, follow: false },
};

const STATUSES = ["draft", "sent", "accepted", "declined"] as const;
const LABEL: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  declined: "Refusé",
};
const TONE: Record<string, BadgeTone> = {
  draft: "neutral",
  sent: "blue",
  accepted: "green",
  declined: "red",
};

type Search = { searchParams: Promise<{ status?: string }> };

export default async function DevisPage({ searchParams }: Search) {
  const { status } = await searchParams;
  const active = STATUSES.includes(status as (typeof STATUSES)[number])
    ? (status as (typeof STATUSES)[number])
    : undefined;
  const rows = await getQuotes(active);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Devis" description="Les devis générés depuis les demandes." />

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Filtrer par statut">
        <Link
          href="/admin/devis"
          className={
            "rounded-full border px-3.5 py-1.5 transition-colors " +
            (!active
              ? "border-acc bg-[color-mix(in_srgb,var(--acc)_12%,transparent)] text-acc"
              : "border-[var(--line)] text-[var(--dim)] hover:border-acc")
          }
        >
          Tous
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/devis?status=${s}`}
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
              <th>Numéro</th>
              <th>Client</th>
              <th>Statut</th>
              <th>Total</th>
              <th>Validité</th>
              <th>Créé le</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id}>
                <td>
                  <Link
                    href={`/admin/devis/${q.id}`}
                    className="font-medium hover:text-acc"
                  >
                    {q.number}
                  </Link>
                </td>
                <td className="text-[var(--dim)]">{q.clientName}</td>
                <td>
                  <Badge tone={TONE[q.status] ?? "neutral"}>
                    {LABEL[q.status] ?? q.status}
                  </Badge>
                </td>
                <td>{formatCentsEUR(q.totalCents)}</td>
                <td className="text-[var(--dim)]">
                  {q.validUntil ? new Date(q.validUntil).toLocaleDateString("fr-BE") : "—"}
                </td>
                <td className="text-[var(--dim)]">
                  {new Date(q.createdAt).toLocaleDateString("fr-BE")}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-[var(--dim)]">
                  Aucun devis.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
