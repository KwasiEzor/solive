import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.cookies;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/cookies", locale)}`,
      languages: { fr: `${site}/cookies`, en: `${site}/en/cookies` },
    },
  };
}

export default async function CookiesPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const l = t.legalPages.cookies;

  return (
    <>
      <PageHeader
        kicker={t.pageHeaders.cookies.kicker}
        title={t.pageHeaders.cookies.title}
        lede={t.pageHeaders.cookies.lede}
      />
      <section className="sec">
        <div className="wrap narrow legal">
          <h2>{l.audienceHeading}</h2>
          <p>{l.audienceP1}</p>
          <p>{l.audienceP2}</p>

          <h2>{l.usedHeading}</h2>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  {t.legal.cookieColumns.map((c) => (
                    <th key={c}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {t.legal.cookieRows.map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>{l.revertHeading}</h2>
          <p>{l.revertText}</p>

          <p className="legal-more">
            {t.legal.seeAlso}{" "}
            <a href={localizedPath("/confidentialite", locale)}>{t.legal.linkLabels.confidentialiteFull}</a>{" "}
            {t.legal.and}{" "}
            <a href={localizedPath("/mentions-legales", locale)}>{t.legal.linkLabels.mentionsLegales}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
