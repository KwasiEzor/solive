import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { SectionEditor } from "@/components/admin/section-editor";
import { restoreSectionRevisionAction } from "@/server/actions/sections";
import { getSectionForEdit, listSectionRevisions } from "@/server/queries/admin";

export const metadata: Metadata = {
  title: "Édition de contenu",
  robots: { index: false, follow: false },
};

type Params = { params: Promise<{ section: string }> };

export default async function ContentSectionPage({ params }: Params) {
  const { section } = await params;
  const row = await getSectionForEdit(section);
  if (!row) notFound();

  const revisions = await listSectionRevisions(row.id);

  async function restore(formData: FormData) {
    "use server";
    const revisionId = String(formData.get("revisionId") ?? "");
    await restoreSectionRevisionAction({ sectionId: row!.id, revisionId });
    revalidatePath(`/admin/contenu/${section}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <SectionEditor
        section={{
          id: row.id,
          key: row.key,
          heading: row.heading,
          kicker: row.kicker,
          body: row.body,
          status: row.status,
          updatedAt: row.updatedAt.toISOString(),
        }}
      />

      <section className="adm-card adm-card-p flex flex-col gap-3">
        <h2 className="font-bold">Historique ({revisions.length})</h2>
        <ul className="flex flex-col divide-y divide-[var(--line2)] text-sm">
          {revisions.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
              <span className="text-[var(--dim)]">
                {new Date(r.createdAt).toLocaleString("fr-BE", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
              <form action={restore}>
                <input type="hidden" name="revisionId" value={r.id} />
                <button type="submit" className="adm-icon-btn px-3 text-xs">
                  Restaurer
                </button>
              </form>
            </li>
          ))}
          {revisions.length === 0 && (
            <li className="py-2.5 text-[var(--dim)]">Aucune révision.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
