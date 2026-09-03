"use client";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge, type BadgeTone } from "@/components/admin/ui";
import { bulkDeleteLeadsAction, deleteLeadAction } from "@/server/actions/leads";

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

export interface LeadRow {
  id: string;
  name: string;
  email: string;
  status: string;
  createdAt: string | Date;
}

/**
 * Row selection + single/bulk delete for the leads inbox. Both paths require
 * an explicit browser confirm() (same convention as CollectionList's
 * delete) and surface a dismissing toast once the server action resolves —
 * deleting a lead is hard/irreversible (no soft-delete column on `leads`),
 * so silent success would be worse than a small banner.
 */
export function LeadsTable({ rows }: { rows: LeadRow[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  function notify(message: string) {
    setToast(message);
    setTimeout(() => setToast((current) => (current === message ? null : current)), 4000);
  }

  function toggleAll() {
    setSelected((s) => (s.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))));
  }

  function toggleOne(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function deleteOne(row: LeadRow) {
    if (
      !window.confirm(
        `Supprimer la demande de « ${row.name} » ? Cette action est définitive.`,
      )
    )
      return;
    start(async () => {
      const res = await deleteLeadAction(row.id);
      if (res.ok) {
        setSelected((s) => {
          const next = new Set(s);
          next.delete(row.id);
          return next;
        });
        notify(`Demande de ${row.name} supprimée.`);
        router.refresh();
      } else {
        notify("Échec de la suppression — réessayez.");
      }
    });
  }

  function deleteSelected() {
    const ids = [...selected];
    if (ids.length === 0) return;
    const n = ids.length;
    if (
      !window.confirm(
        `Supprimer ${n} demande${n > 1 ? "s" : ""} ? Cette action est définitive et irréversible.`,
      )
    )
      return;
    start(async () => {
      const res = await bulkDeleteLeadsAction(ids);
      if (res.ok) {
        notify(
          `${res.value.count} demande${res.value.count > 1 ? "s" : ""} supprimée${res.value.count > 1 ? "s" : ""}.`,
        );
        setSelected(new Set());
        router.refresh();
      } else {
        notify("Échec de la suppression — réessayez.");
      }
    });
  }

  const allSelected = rows.length > 0 && selected.size === rows.length;

  return (
    <div className="flex flex-col gap-3">
      {selected.size > 0 && (
        <div className="adm-card adm-card-p flex items-center justify-between gap-3 text-sm">
          <span>
            {selected.size} demande{selected.size > 1 ? "s" : ""} sélectionnée
            {selected.size > 1 ? "s" : ""}
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={deleteSelected}
            className="adm-btn adm-btn-ghost text-[#ef6b6b]"
          >
            <Trash2 size={15} /> Supprimer la sélection
          </button>
        </div>
      )}

      <div className={"adm-card overflow-x-auto" + (pending ? " opacity-60" : "")}>
        <table className="adm-table">
          <thead>
            <tr>
              <th className="w-8">
                <input
                  type="checkbox"
                  aria-label="Tout sélectionner"
                  checked={allSelected}
                  onChange={toggleAll}
                  disabled={rows.length === 0}
                />
              </th>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Statut</th>
              <th>Reçue</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr key={l.id}>
                <td>
                  <input
                    type="checkbox"
                    aria-label={`Sélectionner ${l.name}`}
                    checked={selected.has(l.id)}
                    onChange={() => toggleOne(l.id)}
                  />
                </td>
                <td>
                  <Link href={`/admin/demandes/${l.id}`} className="font-medium hover:text-acc">
                    {l.name}
                  </Link>
                </td>
                <td className="text-[var(--dim)]">{l.email}</td>
                <td>
                  <Badge tone={TONE[l.status] ?? "neutral"}>{LABEL[l.status] ?? l.status}</Badge>
                </td>
                <td className="text-[var(--dim)]">
                  {new Date(l.createdAt).toLocaleDateString("fr-BE")}
                </td>
                <td className="text-right">
                  <button
                    type="button"
                    disabled={pending}
                    aria-label={`Supprimer la demande de ${l.name}`}
                    title="Supprimer"
                    className="adm-icon-btn danger"
                    onClick={() => deleteOne(l)}
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="text-[var(--dim)]">
                  Aucune demande.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {toast && (
        <div role="status" aria-live="polite" className="adm-toast">
          {toast}
        </div>
      )}
    </div>
  );
}
