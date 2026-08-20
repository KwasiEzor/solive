import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CollectionList,
  type ListItem,
} from "@/components/admin/collection-list";
import { getCollection, meta } from "@/server/admin/collections";
import { listItems } from "@/server/queries/admin-collections";

export const metadata: Metadata = {
  title: "Collection",
  robots: { index: false, follow: false },
};

function cell(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

type Params = { params: Promise<{ collection: string }> };

export default async function CollectionPage({ params }: Params) {
  const { collection } = await params;
  const cfg = getCollection(collection);
  if (!cfg) notFound();

  const rows = await listItems(cfg);
  const items: ListItem[] = rows.map((r) => ({
    id: String(r.id),
    title: cell(r[cfg.titleField]),
    status: String(r.status ?? "draft"),
    cols: cfg.listColumns.map((c) => cell(r[c])),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[var(--dim)]">
            <Link href="/admin/collections" className="hover:text-acc">
              Collections
            </Link>{" "}
            ›
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {cfg.plural}
          </h1>
        </div>
        <Link
          href={`/admin/collections/${collection}/new`}
          className="rounded bg-acc px-4 py-2 text-sm font-semibold text-[var(--on-acc)]"
        >
          Nouveau
        </Link>
      </div>
      <CollectionList
        collectionKey={collection}
        meta={meta(cfg)}
        items={items}
      />
    </div>
  );
}
