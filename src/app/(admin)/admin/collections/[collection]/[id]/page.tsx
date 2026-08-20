import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CollectionForm } from "@/components/admin/collection-form";
import {
  type CollectionConfig,
  getCollection,
  meta,
} from "@/server/admin/collections";
import { getItem } from "@/server/queries/admin-collections";

export const metadata: Metadata = {
  title: "Éditer",
  robots: { index: false, follow: false },
};

/** DB value → form string, per field type. */
function toFormValue(cfg: CollectionConfig, name: string, v: unknown): string {
  const field = cfg.fields.find((f) => f.name === name);
  if (!field) return "";
  switch (field.type) {
    case "list":
      return Array.isArray(v) ? v.join("\n") : "";
    case "boolean":
      return v ? "1" : "";
    case "number":
      return v == null ? "" : String(v);
    case "json":
      return typeof v === "string" ? v : v == null ? "" : JSON.stringify(v);
    default:
      return v == null ? "" : String(v);
  }
}

type Params = { params: Promise<{ collection: string; id: string }> };

export default async function CollectionItemPage({ params }: Params) {
  const { collection, id } = await params;
  const cfg = getCollection(collection);
  if (!cfg) notFound();

  const isNew = id === "new";
  const initial: Record<string, string> = {};
  let expectedUpdatedAt: string | null = null;

  if (!isNew) {
    const row = await getItem(cfg, id);
    if (!row) notFound();
    for (const f of cfg.fields) {
      initial[f.name] = toFormValue(cfg, f.name, row[f.name]);
    }
    expectedUpdatedAt = (row.updatedAt as Date).toISOString();
  } else {
    for (const f of cfg.fields) initial[f.name] = "";
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold tracking-tight">
        {isNew ? `Nouveau ${cfg.singular}` : `Éditer — ${cfg.plural}`}
      </h1>
      <CollectionForm
        collectionKey={collection}
        meta={meta(cfg)}
        id={isNew ? null : id}
        initial={initial}
        expectedUpdatedAt={expectedUpdatedAt}
      />
    </div>
  );
}
