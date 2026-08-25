import { Boxes, ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/admin/ui";
import { listCollections } from "@/server/admin/collections";

export const metadata: Metadata = {
  title: "Collections",
  robots: { index: false, follow: false },
};

export default function CollectionsHub() {
  const collections = listCollections();
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Collections"
        description="Gérez le contenu répétable du site : créer, éditer, réordonner, publier."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {collections.map((c) => (
          <Link
            key={c.key}
            href={`/admin/collections/${c.key}`}
            className="adm-card group flex items-center gap-4 p-5 transition-colors hover:border-acc"
          >
            <span className="grid h-11 w-11 flex-none place-items-center rounded-lg bg-[color-mix(in_srgb,var(--acc)_14%,transparent)] text-acc">
              <Boxes size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{c.plural}</span>
              <span className="block text-sm text-[var(--dim)]">
                {c.fields.length} champs · {c.orderable ? "réordonnable" : "ordre fixe"}
              </span>
            </span>
            <ChevronRight
              size={18}
              className="flex-none text-[var(--dim)] transition-transform group-hover:translate-x-0.5 group-hover:text-acc"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
