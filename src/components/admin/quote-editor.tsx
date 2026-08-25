"use client";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { formatCentsEUR } from "@/lib/money";
import {
  deleteQuoteAction,
  markQuoteSentAction,
  updateQuoteAction,
} from "@/server/actions/quotes";

type SaveState = "saved" | "saving" | "dirty" | "error";

const STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  sent: "Envoyé",
  accepted: "Accepté",
  declined: "Refusé",
};

export interface EditableQuoteItem {
  description: string;
  quantity: number;
  unitPriceCents: number;
}

export interface EditableQuote {
  id: string;
  number: string;
  status: "draft" | "sent" | "accepted" | "declined";
  clientName: string;
  clientEmail: string;
  clientCompany: string | null;
  vatRate: string;
  validUntil: string | null;
  notes: string | null;
  updatedAt: string;
}

interface Row {
  description: string;
  quantity: number;
  unitPriceEuro: string;
}

function toRow(it: EditableQuoteItem): Row {
  return {
    description: it.description,
    quantity: it.quantity,
    unitPriceEuro: (it.unitPriceCents / 100).toFixed(2),
  };
}

function rowCents(r: Row): number {
  const price = Number.parseFloat(r.unitPriceEuro || "0");
  if (!Number.isFinite(price) || !Number.isFinite(r.quantity)) return 0;
  return Math.round(r.quantity * Math.round(price * 100));
}

export function QuoteEditor({
  quote,
  items,
}: {
  quote: EditableQuote;
  items: EditableQuoteItem[];
}) {
  const editable = quote.status === "draft";
  const [clientName, setClientName] = useState(quote.clientName);
  const [clientEmail, setClientEmail] = useState(quote.clientEmail);
  const [clientCompany, setClientCompany] = useState(quote.clientCompany ?? "");
  const [vatRate, setVatRate] = useState(quote.vatRate);
  const [validUntil, setValidUntil] = useState(quote.validUntil?.slice(0, 10) ?? "");
  const [notes, setNotes] = useState(quote.notes ?? "");
  const [rows, setRows] = useState<Row[]>(
    items.length > 0 ? items.map(toRow) : [{ description: "", quantity: 1, unitPriceEuro: "0.00" }],
  );
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [conflict, setConflict] = useState(false);
  const updatedAt = useRef(quote.updatedAt);

  const subtotalCents = rows.reduce((sum, r) => sum + rowCents(r), 0);
  const vatAmountCents = Math.round(
    (subtotalCents * (Number.parseFloat(vatRate || "0") || 0)) / 100,
  );
  const totalCents = subtotalCents + vatAmountCents;

  const markDirty = () => setSaveState("dirty");

  const updateRow = (i: number, patch: Partial<Row>) => {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
    markDirty();
  };
  const addRow = () => {
    setRows((r) => [...r, { description: "", quantity: 1, unitPriceEuro: "0.00" }]);
    markDirty();
  };
  const removeRow = (i: number) => {
    setRows((r) => (r.length > 1 ? r.filter((_, idx) => idx !== i) : r));
    markDirty();
  };

  const doSave = useCallback(async (): Promise<boolean> => {
    setSaveState("saving");
    const res = await updateQuoteAction({
      id: quote.id,
      clientName,
      clientEmail,
      clientCompany: clientCompany.trim() || undefined,
      vatRate: Number.parseFloat(vatRate || "0") || 0,
      validUntil: validUntil ? new Date(validUntil).toISOString() : null,
      notes: notes.trim() || undefined,
      items: rows.map((r) => ({
        description: r.description,
        quantity: r.quantity,
        unitPriceCents: Math.round((Number.parseFloat(r.unitPriceEuro || "0") || 0) * 100),
      })),
      expectedUpdatedAt: updatedAt.current,
    });
    if (res.ok) {
      updatedAt.current = res.value.updatedAt;
      setSaveState("saved");
      return true;
    }
    if (res.error === "conflict") setConflict(true);
    setSaveState("error");
    return false;
  }, [quote.id, clientName, clientEmail, clientCompany, vatRate, validUntil, notes, rows]);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-tight">{quote.number}</h1>
          <span
            className={
              "adm-badge " +
              (quote.status === "sent" || quote.status === "accepted"
                ? "green"
                : quote.status === "declined"
                  ? "red"
                  : "neutral")
            }
          >
            {STATUS_LABEL[quote.status] ?? quote.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {editable && (
            <span
              aria-live="polite"
              className={
                "text-sm " +
                (saveState === "error" ? "text-red-500" : "text-[var(--dim)]")
              }
            >
              {saveState === "saving"
                ? "Enregistrement…"
                : saveState === "dirty"
                  ? "Modifications non enregistrées"
                  : saveState === "error"
                    ? "Échec — réessayer"
                    : "Enregistré"}
            </span>
          )}
          <a
            href={`/api/admin/devis/${quote.id}/pdf`}
            className="adm-btn adm-btn-ghost text-sm"
          >
            Télécharger le PDF
          </a>
          {editable && (
            <>
              <button
                type="button"
                onClick={() => void doSave()}
                className="adm-btn adm-btn-ghost text-sm"
              >
                Enregistrer
              </button>
              <form action={markQuoteSentAction}>
                <input type="hidden" name="quoteId" value={quote.id} />
                <button type="submit" className="adm-btn adm-btn-primary text-sm">
                  Marquer comme envoyé
                </button>
              </form>
              <form action={deleteQuoteAction}>
                <input type="hidden" name="quoteId" value={quote.id} />
                <button type="submit" className="adm-icon-btn danger text-sm">
                  <Trash2 size={16} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {conflict && (
        <p
          role="alert"
          className="adm-card adm-card-p border-red-500/50 text-sm text-red-500"
        >
          Ce devis a été modifié ailleurs depuis votre ouverture. Rechargez la
          page pour récupérer la dernière version.
        </p>
      )}

      <div className="adm-card adm-card-p flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="clientName" className="text-sm font-medium">
              Client
            </label>
            <input
              id="clientName"
              value={clientName}
              disabled={!editable}
              onChange={(e) => {
                setClientName(e.target.value);
                markDirty();
              }}
              className="adm-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="clientEmail" className="text-sm font-medium">
              E-mail
            </label>
            <input
              id="clientEmail"
              type="email"
              value={clientEmail}
              disabled={!editable}
              onChange={(e) => {
                setClientEmail(e.target.value);
                markDirty();
              }}
              className="adm-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="clientCompany" className="text-sm font-medium">
              Société
            </label>
            <input
              id="clientCompany"
              value={clientCompany}
              disabled={!editable}
              onChange={(e) => {
                setClientCompany(e.target.value);
                markDirty();
              }}
              className="adm-input"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="vatRate" className="text-sm font-medium">
              TVA (%)
            </label>
            <input
              id="vatRate"
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={vatRate}
              disabled={!editable}
              onChange={(e) => {
                setVatRate(e.target.value);
                markDirty();
              }}
              className="adm-input"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="validUntil" className="text-sm font-medium">
              Valable jusqu’au
            </label>
            <input
              id="validUntil"
              type="date"
              value={validUntil}
              disabled={!editable}
              onChange={(e) => {
                setValidUntil(e.target.value);
                markDirty();
              }}
              className="adm-input"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Lignes</span>
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Qté</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                  {editable && <th />}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>
                      <input
                        value={r.description}
                        disabled={!editable}
                        onChange={(e) => updateRow(i, { description: e.target.value })}
                        className="adm-input w-full"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={r.quantity}
                        disabled={!editable}
                        onChange={(e) =>
                          updateRow(i, { quantity: Number.parseFloat(e.target.value) || 0 })
                        }
                        className="adm-input w-20"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={r.unitPriceEuro}
                        disabled={!editable}
                        onChange={(e) => updateRow(i, { unitPriceEuro: e.target.value })}
                        className="adm-input w-28"
                      />
                    </td>
                    <td className="text-[var(--dim)]">{formatCentsEUR(rowCents(r))}</td>
                    {editable && (
                      <td>
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="adm-icon-btn danger"
                          aria-label="Supprimer la ligne"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editable && (
            <button
              type="button"
              onClick={addRow}
              className="adm-btn adm-btn-ghost self-start text-sm"
            >
              <Plus size={16} /> Ajouter une ligne
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes / conditions
          </label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            disabled={!editable}
            onChange={(e) => {
              setNotes(e.target.value);
              markDirty();
            }}
            className="adm-input"
          />
        </div>

        <dl className="ml-auto flex flex-col gap-1 text-sm">
          <div className="flex justify-between gap-8">
            <dt className="text-[var(--dim)]">Sous-total</dt>
            <dd>{formatCentsEUR(subtotalCents)}</dd>
          </div>
          <div className="flex justify-between gap-8">
            <dt className="text-[var(--dim)]">TVA ({vatRate || 0}%)</dt>
            <dd>{formatCentsEUR(vatAmountCents)}</dd>
          </div>
          <div className="flex justify-between gap-8 font-bold">
            <dt>Total</dt>
            <dd>{formatCentsEUR(totalCents)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
