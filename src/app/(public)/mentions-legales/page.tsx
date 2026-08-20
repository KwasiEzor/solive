import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/server/queries/content";

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Informations légales de Solive : éditeur, hébergement, propriété intellectuelle et règlement des litiges.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/mentions-legales` },
};

export default async function MentionsLegalesPage() {
  const s = await getSiteSettings();
  const email = s?.email ?? "bonjour@solive.pro";
  const name = s?.name ?? "Solive";
  const vat = s?.vat ?? "[À COMPLÉTER]";
  const address = s?.address ?? "Bruxelles, Belgique";
  const phone = s?.phone;

  return (
    <>
      <PageHeader
        kicker="Mentions légales"
        title="Qui édite ce site."
        lede="Les informations légales requises, en clair."
      />
      <section className="sec">
        <div className="wrap narrow legal">
          <h2>Éditeur</h2>
          <p>
            {name}, studio de développement.<br />
            Siège : {address}.<br />
            {phone && (
              <>
                Téléphone : {phone}.<br />
              </>
            )}
            Contact : <a href={`mailto:${email}`}>{email}</a>.<br />
            N° de TVA : {vat}.<br />
            <em>Forme juridique et numéro d’entreprise (BCE) : [À COMPLÉTER].</em>
          </p>

          <h2>Directeur de la publication</h2>
          <p>Le représentant légal de {name}. [À COMPLÉTER].</p>

          <h2>Hébergement</h2>
          <p>
            Site hébergé par Vercel et Supabase, sur une infrastructure située
            dans l’Union européenne.
          </p>

          <h2>Propriété intellectuelle</h2>
          <p>
            Les textes, la charte graphique et le code de ce site sont la
            propriété de {name}, sauf mention contraire. Le code livré dans le
            cadre d’un projet client appartient au client, comme indiqué dans le
            devis. Toute reproduction non autorisée du présent site est interdite.
          </p>

          <h2>Responsabilité</h2>
          <p>
            {name} s’efforce d’assurer l’exactitude des informations publiées,
            sans garantie d’exhaustivité. Les liens externes n’engagent pas notre
            responsabilité.
          </p>

          <h2>Règlement des litiges</h2>
          <p>
            En cas de litige, une solution amiable sera recherchée en priorité.
            La plateforme européenne de règlement en ligne des litiges est
            accessible à{" "}
            <a href="https://ec.europa.eu/consumers/odr" rel="noopener noreferrer" target="_blank">
              ec.europa.eu/consumers/odr
            </a>
            . Le droit belge est applicable.
          </p>

          <p className="legal-more">
            Voir aussi la <a href="/confidentialite">confidentialité</a> et les{" "}
            <a href="/cookies">cookies</a>.
          </p>
        </div>
      </section>
    </>
  );
}
