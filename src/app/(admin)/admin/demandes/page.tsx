import type { Metadata } from "next";
import Link from "next/link";
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Demandes</h1>
        {/* Route handler returning a CSV download — not a page navigation. */}
        <a
          href="/admin/demandes/export"
          download
          className="rounded border border-[var(--line)] px-3 py-1.5 text-sm hover:border-acc"
        >
          Export CSV
        </a>
      </div>

      <nav className="flex flex-wrap gap-2 text-sm" aria-label="Filtrer par statut">
        <Link
          href="/admin/demandes"
          className={
            "rounded border px-3 py-1 " +
            (!active ? "border-acc text-acc" : "border-[var(--line)]")
          }
        >
          Toutes
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/demandes?status=${s}`}
            className={
              "rounded border px-3 py-1 " +
              (active === s ? "border-acc text-acc" : "border-[var(--line)]")
            }
          >
            {LABEL[s]}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--line)] text-left text-[var(--dim)]">
              <th className="py-2 pr-4 font-medium">Nom</th>
              <th className="py-2 pr-4 font-medium">E-mail</th>
              <th className="py-2 pr-4 font-medium">Statut</th>
              <th className="py-2 font-medium">Reçue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-b border-[var(--line2)]">
                <td className="py-2 pr-4">
                  <Link href={`/admin/demandes/${l.id}`} className="hover:text-acc">
                    {l.name}
                  </Link>
                </td>
                <td className="py-2 pr-4">{l.email}</td>
                <td className="py-2 pr-4">{LABEL[l.status]}</td>
                <td className="py-2 text-[var(--dim)]">
                  {new Date(l.createdAt).toLocaleDateString("fr-BE")}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="py-3 text-[var(--dim)]">
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
