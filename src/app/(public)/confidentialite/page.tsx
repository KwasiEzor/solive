import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
import { renderTiptap } from "@/lib/tiptap/render";
import { getLegalPage } from "@/server/queries/content";

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
  const [intro, outro] = await Promise.all([
    getLegalPage("confidentialite", locale),
    getLegalPage("confidentialite-suite", locale),
  ]);

  return (
    <>
      <PageHeader
        kicker={t.pageHeaders.confidentialite.kicker}
        title={t.pageHeaders.confidentialite.title}
        lede={t.pageHeaders.confidentialite.lede}
      />
      <section className="sec">
        <div className="wrap narrow legal">
          {intro && (
            <p className="legal-updated mono tiny dim">
              {t.legal.updatedOn(
                new Date(intro.updatedAt).toLocaleDateString(
                  locale === "en" ? "en-GB" : "fr-BE",
                ),
              )}
            </p>
          )}

          {renderTiptap(intro?.body)}

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

          {renderTiptap(outro?.body)}

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
