import { Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LeadsTable } from "@/components/admin/leads-table";
import { PageHeader } from "@/components/admin/ui";
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

      <LeadsTable rows={rows} />
    </div>
  );
}
