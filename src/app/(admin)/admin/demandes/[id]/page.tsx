import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { addLeadNoteAction, updateLeadStatusAction } from "@/server/actions/leads";
import { getLead } from "@/server/queries/admin";

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

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{lead.name}</h1>
        <p className="text-sm text-[var(--dim)]">
          <a href={`mailto:${lead.email}`} className="hover:text-acc">
            {lead.email}
          </a>
          {lead.company ? ` · ${lead.company}` : ""}
        </p>
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
