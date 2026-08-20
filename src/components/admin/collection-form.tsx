"use client";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { createItem, updateItem } from "@/server/actions/collections";
import type { CollectionMeta } from "@/server/admin/collections";

const ERRORS: Record<string, string> = {
  invalid: "Il manque un ou plusieurs champs requis.",
  conflict: "L’élément a été modifié entre-temps. Rechargez la page.",
  not_found: "Élément introuvable.",
  invalid_collection: "Collection inconnue.",
  unauthorized: "Non autorisé.",
};

export function CollectionForm({
  collectionKey,
  meta,
  id,
  initial,
  expectedUpdatedAt,
}: {
  collectionKey: string;
  meta: CollectionMeta;
  id: string | null;
  initial: Record<string, string>;
  expectedUpdatedAt: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [error, setError] = useState<string | null>(null);
  const set = (name: string, v: string) =>
    setValues((s) => ({ ...s, [name]: v }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = id
        ? await updateItem(collectionKey, id, values, expectedUpdatedAt ?? "")
        : await createItem(collectionKey, values);
      if (!res.ok) {
        setError(ERRORS[res.error] ?? "Erreur inattendue.");
        return;
      }
      router.push(`/admin/collections/${collectionKey}`);
      router.refresh();
    });
  };

  const inputCls =
    "w-full rounded border border-[var(--line)] bg-[var(--bg2)] px-3 py-2 text-sm";

  return (
    <form onSubmit={submit} className="flex max-w-2xl flex-col gap-4">
      {meta.fields.map((f) => (
        <label key={f.name} className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            {f.label}
            {f.required && <span className="text-red-400"> *</span>}
          </span>
          {f.type === "textarea" || f.type === "json" || f.type === "list" ? (
            <textarea
              className={inputCls}
              rows={f.type === "json" ? 8 : 4}
              required={f.required}
              value={values[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
            />
          ) : f.type === "boolean" ? (
            <input
              type="checkbox"
              className="h-4 w-4 self-start"
              checked={values[f.name] === "1"}
              onChange={(e) => set(f.name, e.target.checked ? "1" : "")}
            />
          ) : (
            <input
              type={f.type === "number" ? "number" : "text"}
              className={inputCls}
              required={f.required}
              value={values[f.name] ?? ""}
              onChange={(e) => set(f.name, e.target.value)}
            />
          )}
          {f.help && (
            <span className="text-xs text-[var(--dim)]">{f.help}</span>
          )}
        </label>
      ))}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-acc px-4 py-2 text-sm font-semibold text-[var(--on-acc)] disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : id ? "Enregistrer" : "Créer"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/collections/${collectionKey}`)}
          className="rounded border border-[var(--line)] px-4 py-2 text-sm"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
