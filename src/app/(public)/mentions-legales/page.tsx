import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
import { getSiteSettings } from "@/server/queries/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.mentionsLegales;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/mentions-legales", locale)}`,
      languages: { fr: `${site}/mentions-legales`, en: `${site}/en/mentions-legales` },
    },
  };
}

export default async function MentionsLegalesPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const l = t.legalPages.mentionsLegales;
  const s = await getSiteSettings();
  const email = s?.email ?? "bonjour@solive.pro";
  const name = s?.name ?? "Solive";
  const vat = s?.vat ?? "[À COMPLÉTER]";
  const address = s?.address ?? "Charleroi, Belgique";
  const phone = s?.phone;

  return (
    <>
      <PageHeader
        kicker={t.pageHeaders.mentionsLegales.kicker}
        title={t.pageHeaders.mentionsLegales.title}
        lede={t.pageHeaders.mentionsLegales.lede}
      />
      <section className="sec">
        <div className="wrap narrow legal">
          <h2>{l.editeurHeading}</h2>
          <p>
            {l.editeurStudio(name)}
            <br />
            {l.editeurSiege(address)}
            <br />
            {phone && (
              <>
                {l.editeurTel(phone)}
                <br />
              </>
            )}
            {l.editeurContact} <a href={`mailto:${email}`}>{email}</a>.<br />
            {l.editeurVat(vat)}
            <br />
            <em>{l.editeurForme}</em>
          </p>

          <h2>{l.directeurHeading}</h2>
          <p>{l.directeurText(name)}</p>

          <h2>{l.hebergementHeading}</h2>
          <p>{l.hebergementText}</p>

          <h2>{l.proprieteHeading}</h2>
          <p>{l.proprieteText(name)}</p>

          <h2>{l.responsabiliteHeading}</h2>
          <p>{l.responsabiliteText(name)}</p>

          <h2>{l.litigesHeading}</h2>
          <p>
            {l.litigesIntro}{" "}
            <a href="https://ec.europa.eu/consumers/odr" rel="noopener noreferrer" target="_blank">
              ec.europa.eu/consumers/odr
            </a>
            {l.litigesOutro}
          </p>

          <p className="legal-more">
            {t.legal.seeAlso}{" "}
            <a href={localizedPath("/confidentialite", locale)}>{t.legal.linkLabels.confidentialite}</a>{" "}
            {t.legal.and}{" "}
            <a href={localizedPath("/cookies", locale)}>{t.legal.linkLabels.cookies}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
