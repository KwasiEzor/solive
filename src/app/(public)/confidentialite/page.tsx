import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
import { getSiteSettings } from "@/server/queries/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.confidentialite;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/confidentialite", locale)}`,
      languages: { fr: `${site}/confidentialite`, en: `${site}/en/confidentialite` },
    },
  };
}

export default async function ConfidentialitePage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const l = t.legalPages.confidentialite;
  const s = await getSiteSettings();
  const email = s?.email ?? "bonjour@solive.pro";
  const name = s?.name ?? "Solive";

  return (
    <>
      <PageHeader
        kicker={t.pageHeaders.confidentialite.kicker}
        title={t.pageHeaders.confidentialite.title}
        lede={t.pageHeaders.confidentialite.lede}
      />
      <section className="sec">
        <div className="wrap narrow legal">
          <p className="legal-updated mono tiny dim">{l.updated}</p>

          <h2>{l.responsableHeading}</h2>
          <p>
            {l.responsableText(name)}
            <br />
            {l.responsableContact} <a href={`mailto:${email}`}>{email}</a>.<br />
            <em>{l.responsableLegal}</em>
          </p>

          <h2>{l.donneesHeading}</h2>
          <ul>
            <li>{l.donneesForm}</li>
            <li>{l.donneesTech}</li>
            <li>{l.donneesAudience}</li>
          </ul>

          <h2>{l.finalitesHeading}</h2>
          <ul>
            <li>{l.finalite1}</li>
            <li>{l.finalite2}</li>
            <li>{l.finalite3}</li>
            <li>{l.finalite4}</li>
          </ul>

          <h2>{l.sousTraitantsHeading}</h2>
          <p>{l.sousTraitantsIntro}</p>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  {t.legal.subprocessorsColumns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.legal.subprocessors.map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>{l.dureesHeading}</h2>
          <ul>
            <li>{l.duree1}</li>
            <li>{l.duree2}</li>
            <li>{l.duree3}</li>
          </ul>

          <h2>{l.droitsHeading}</h2>
          <p>
            {l.droitsIntro} <a href={`mailto:${email}`}>{email}</a>
            {l.droitsMid}{" "}
            <a
              href="https://www.autoriteprotectiondonnees.be"
              rel="noopener noreferrer"
              target="_blank"
            >
              autoriteprotectiondonnees.be
            </a>
            .
          </p>

          <h2>{l.transfertsHeading}</h2>
          <p>{l.transfertsText}</p>

          <h2>{l.securiteHeading}</h2>
          <p>{l.securiteText}</p>

          <p className="legal-more">
            {t.legal.seeAlso}{" "}
            <a href={localizedPath("/cookies", locale)}>{t.legal.linkLabels.cookiesFull}</a>{" "}
            {t.legal.and}{" "}
            <a href={localizedPath("/mentions-legales", locale)}>{t.legal.linkLabels.mentionsLegales}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
