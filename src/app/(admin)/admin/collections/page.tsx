import type { Metadata } from "next";
import Link from "next/link";
import { listCollections } from "@/server/admin/collections";

export const metadata: Metadata = {
  title: "Collections",
  robots: { index: false, follow: false },
};

export default function CollectionsHub() {
  const collections = listCollections();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Collections</h1>
        <p className="text-sm text-[var(--dim)]">
          Gérez le contenu répétable du site : créer, éditer, réordonner,
          publier.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {collections.map((c) => (
          <Link
            key={c.key}
            href={`/admin/collections/${c.key}`}
            className="rounded border border-[var(--line)] bg-[var(--bg2)] p-5 hover:border-acc"
          >
            <p className="font-semibold">{c.plural}</p>
            <p className="text-sm text-[var(--dim)]">
              {c.fields.length} champs · {c.orderable ? "réordonnable" : "—"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
