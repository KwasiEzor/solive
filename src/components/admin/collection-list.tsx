"use client";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  deleteItem,
  reorderItem,
  togglePublishItem,
} from "@/server/actions/collections";
import type { CollectionMeta } from "@/server/admin/collections";
import { Badge } from "@/components/admin/ui";

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
      <div className="adm-card adm-card-p text-sm text-[var(--dim)]">
        Aucun élément. Créez le premier avec « Nouveau ».
      </div>
    );
  }

  return (
    <div
      className={
        "adm-card overflow-x-auto" + (pending ? " opacity-60" : "")
      }
    >
      <table className="adm-table">
        <thead>
          <tr>
            {meta.listColumns.map((c) => (
              <th key={c}>
                {meta.fields.find((f) => f.name === c)?.label ?? c}
              </th>
            ))}
            <th>Statut</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.id}>
              {it.cols.map((v, j) => (
                <td key={j} className="max-w-xs truncate">
                  {v || "—"}
                </td>
              ))}
              <td>
                <Badge tone={it.status === "published" ? "green" : "neutral"}>
                  {it.status === "published" ? "Publié" : "Brouillon"}
                </Badge>
              </td>
              <td>
                <div className="flex items-center justify-end gap-1.5">
                  {meta.orderable && (
                    <>
                      <button
                        type="button"
                        aria-label="Monter"
                        disabled={pending || i === 0}
                        className="adm-icon-btn"
                        onClick={() =>
                          run(() => reorderItem(collectionKey, it.id, "up"))
                        }
                      >
                        <ChevronUp size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label="Descendre"
                        disabled={pending || i === items.length - 1}
                        className="adm-icon-btn"
                        onClick={() =>
                          run(() => reorderItem(collectionKey, it.id, "down"))
                        }
                      >
                        <ChevronDown size={15} />
                      </button>
                    </>
                  )}
                  {meta.publishable && (
                    <button
                      type="button"
                      disabled={pending}
                      aria-label={
                        it.status === "published" ? "Dépublier" : "Publier"
                      }
                      title={it.status === "published" ? "Dépublier" : "Publier"}
                      className="adm-icon-btn"
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
                      {it.status === "published" ? (
                        <EyeOff size={15} />
                      ) : (
                        <Eye size={15} />
                      )}
                    </button>
                  )}
                  <Link
                    href={`/admin/collections/${collectionKey}/${it.id}`}
                    aria-label="Éditer"
                    title="Éditer"
                    className="adm-icon-btn"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    type="button"
                    disabled={pending}
                    aria-label="Supprimer"
                    title="Supprimer"
                    className="adm-icon-btn danger"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Supprimer « ${it.title} » ? L’élément disparaîtra du site (réversible en base).`,
                        )
                      ) {
                        run(() => deleteItem(collectionKey, it.id));
                      }
                    }}
                  >
                    <Trash2 size={15} />
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
