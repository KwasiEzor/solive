import { getLegalPage } from "@/server/queries/content";

/** Renders a legal page from the DB; content becomes editable in Phase 8. */
export async function LegalContent({
  slug,
  fallbackTitle,
}: {
  slug: string;
  fallbackTitle: string;
}) {
  const page = await getLegalPage(slug);
  const title = page?.title ?? fallbackTitle;
  return (
    <section className="sec">
      <div className="wrap narrow">
        <h1 style={{ fontSize: "clamp(2rem,4vw,3rem)" }}>{title}</h1>
        <p className="lede" style={{ marginTop: 24 }}>
          {page
            ? "Contenu à jour."
            : "Cette page sera renseignée depuis l’espace d’administration (mentions légales belges : dénomination, BCE, TVA, siège, contact, règlement des litiges)."}
        </p>
      </div>
    </section>
  );
}
