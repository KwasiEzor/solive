"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  deleteItem,
  reorderItem,
  togglePublishItem,
} from "@/server/actions/collections";
import type { CollectionMeta } from "@/server/admin/collections";

export interface ListItem {
  id: string;
  title: string;
  status: string;
  cols: string[];
}

export function CollectionList({
  collectionKey,
  meta,
  items,
}: {
  collectionKey: string;
  meta: CollectionMeta;
  items: ListItem[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<unknown>) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  if (items.length === 0) {
    return (
      <p className="text-sm text-[var(--dim)]">
        Aucun élément. Créez le premier avec « Nouveau ».
      </p>
    );
  }

  return (
    <div
      className={
        "overflow-x-auto rounded border border-[var(--line)]" +
        (pending ? " opacity-60" : "")
      }
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--line)] text-left text-[var(--dim)]">
            {meta.listColumns.map((c) => (
              <th key={c} className="px-3 py-2 font-medium">
                {meta.fields.find((f) => f.name === c)?.label ?? c}
              </th>
            ))}
            <th className="px-3 py-2 font-medium">Statut</th>
            <th className="px-3 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.id} className="border-b border-[var(--line)]">
              {it.cols.map((v, j) => (
                <td key={j} className="max-w-xs truncate px-3 py-2">
                  {v || "—"}
                </td>
              ))}
              <td className="px-3 py-2">
                <span
                  className={
                    "rounded bg-[var(--bg3)] px-1.5 py-0.5 text-xs " +
                    (it.status === "published"
                      ? "text-acc"
                      : "text-[var(--dim)]")
                  }
                >
                  {it.status === "published" ? "Publié" : "Brouillon"}
                </span>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center justify-end gap-1.5">
                  {meta.orderable && (
                    <>
                      <button
                        type="button"
                        aria-label="Monter"
                        disabled={pending || i === 0}
                        className="rounded border border-[var(--line)] px-1.5 py-0.5 disabled:opacity-40"
                        onClick={() =>
                          run(() => reorderItem(collectionKey, it.id, "up"))
                        }
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        aria-label="Descendre"
                        disabled={pending || i === items.length - 1}
                        className="rounded border border-[var(--line)] px-1.5 py-0.5 disabled:opacity-40"
                        onClick={() =>
                          run(() => reorderItem(collectionKey, it.id, "down"))
                        }
                      >
                        ↓
                      </button>
                    </>
                  )}
                  {meta.publishable && (
                    <button
                      type="button"
                      disabled={pending}
                      className="rounded border border-[var(--line)] px-2 py-0.5"
                      onClick={() =>
                        run(() =>
                          togglePublishItem(
                            collectionKey,
                            it.id,
                            it.status !== "published",
                          ),
                        )
                      }
                    >
                      {it.status === "published" ? "Dépublier" : "Publier"}
                    </button>
                  )}
                  <Link
                    href={`/admin/collections/${collectionKey}/${it.id}`}
                    className="rounded border border-[var(--line)] px-2 py-0.5 hover:border-acc"
                  >
                    Éditer
                  </Link>
                  <button
                    type="button"
                    disabled={pending}
                    className="rounded border border-[var(--line)] px-2 py-0.5 text-red-400 hover:border-red-400"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Supprimer « ${it.title} » ? Cette action est réversible depuis la base, mais l’élément disparaîtra du site.`,
                        )
                      ) {
                        run(() => deleteItem(collectionKey, it.id));
                      }
                    }}
                  >
                    Suppr.
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
