import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteLeadButton } from "@/components/admin/delete-lead-button";
import { Badge, type BadgeTone } from "@/components/admin/ui";
import { formatCentsEUR } from "@/lib/money";
import { addLeadNoteAction, updateLeadStatusAction } from "@/server/actions/leads";
import { createQuoteFromLeadAction } from "@/server/actions/quotes";
import { getLead, getQuotesForLead } from "@/server/queries/admin";

const QUOTE_STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  declined: "Refusé",
};
const QUOTE_STATUS_TONE: Record<string, BadgeTone> = {
  draft: "neutral",
  sent: "blue",
  accepted: "green",
  declined: "red",
};

export const metadata: Metadata = {
  title: "Demande",
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

type Params = { params: Promise<{ id: string }> };

export default async function LeadDetailPage({ params }: Params) {
  const { id } = await params;
  const data = await getLead(id);
  if (!data) notFound();
  const { lead, events } = data;
  const projectTypes = Array.isArray(lead.projectTypes) ? lead.projectTypes : [];
  const quotesForLead = await getQuotesForLead(id);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{lead.name}</h1>
          <p className="text-sm text-[var(--dim)]">
            <a href={`mailto:${lead.email}`} className="hover:text-acc">
              {lead.email}
            </a>
            {lead.company ? ` · ${lead.company}` : ""}
          </p>
        </div>
        <DeleteLeadButton id={lead.id} name={lead.name} />
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
        <dt className="text-[var(--dim)]">Statut</dt>
        <dd>
          <form action={updateLeadStatusAction} className="flex items-center gap-2">
            <input type="hidden" name="leadId" value={lead.id} />
            <select
              name="status"
              defaultValue={lead.status}
              aria-label="Statut de la demande"
              className="rounded border border-[var(--line)] bg-[var(--bg2)] px-2 py-1"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {LABEL[s]}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded border border-[var(--line)] px-2 py-1 hover:border-acc"
            >
              Mettre à jour
            </button>
          </form>
        </dd>
        {projectTypes.length > 0 && (
          <>
            <dt className="text-[var(--dim)]">Type</dt>
            <dd>{projectTypes.join(", ")}</dd>
          </>
        )}
        {lead.budgetRange && (
          <>
            <dt className="text-[var(--dim)]">Budget</dt>
            <dd>{lead.budgetRange}</dd>
          </>
        )}
        <dt className="text-[var(--dim)]">Reçue</dt>
        <dd>{new Date(lead.createdAt).toLocaleString("fr-BE")}</dd>
      </dl>

      <div>
        <h2 className="mb-1 text-sm font-medium text-[var(--dim)]">Message</h2>
        <p className="whitespace-pre-wrap rounded border border-[var(--line)] bg-[var(--bg2)] p-3 text-sm">
          {lead.message}
        </p>
      </div>

      <form action={addLeadNoteAction} className="flex flex-col gap-2">
        <label htmlFor="note" className="text-sm font-medium">
          Note interne
        </label>
        <textarea
          id="note"
          name="note"
          rows={2}
          className="rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2 text-sm"
        />
        <input type="hidden" name="leadId" value={lead.id} />
        <button
          type="submit"
          className="self-start rounded bg-acc px-3 py-1.5 text-sm font-semibold text-on-acc"
        >
          Ajouter la note
        </button>
      </form>

      <section className="adm-card adm-card-p flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-bold">Devis</h2>
          <form action={createQuoteFromLeadAction}>
            <input type="hidden" name="leadId" value={lead.id} />
            <button type="submit" className="adm-btn adm-btn-primary text-sm">
              Créer un devis
            </button>
          </form>
        </div>
        {quotesForLead.length > 0 ? (
          <div className="-mx-5 -mb-5 overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Statut</th>
                  <th>Total</th>
                  <th>Créé le</th>
                </tr>
              </thead>
              <tbody>
                {quotesForLead.map((q) => (
                  <tr key={q.id}>
                    <td>
                      <Link href={`/admin/devis/${q.id}`} className="font-medium hover:text-acc">
                        {q.number}
                      </Link>
                    </td>
                    <td>
                      <Badge tone={QUOTE_STATUS_TONE[q.status] ?? "neutral"}>
                        {QUOTE_STATUS_LABEL[q.status] ?? q.status}
                      </Badge>
                    </td>
                    <td>{formatCentsEUR(q.totalCents)}</td>
                    <td className="text-[var(--dim)]">
                      {new Date(q.createdAt).toLocaleDateString("fr-BE")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[var(--dim)]">Aucun devis pour cette demande.</p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-[var(--dim)]">Historique</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {events.map((e) => (
            <li key={e.id} className="flex justify-between gap-4">
              <span>
                {e.type === "note"
                  ? `Note : ${(e.payload as { text?: string })?.text ?? ""}`
                  : e.type === "status_change"
                    ? `Statut → ${LABEL[(e.payload as { to?: string })?.to ?? ""] ?? ""}`
                    : e.type}
              </span>
              <span className="shrink-0 text-[var(--dim)]">
                {new Date(e.createdAt).toLocaleString("fr-BE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </li>
          ))}
          {events.length === 0 && (
            <li className="text-[var(--dim)]">Aucun évènement.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
