import type { Metadata } from "next";
import { Travaux } from "@/components/site/sections";
import { ContactCta, PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
import { getProjects, getSectionsMap } from "@/server/queries/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.realisations;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/realisations", locale)}`,
      languages: { fr: `${site}/realisations`, en: `${site}/en/realisations` },
    },
  };
}

export default async function RealisationsPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const [projects, sections] = await Promise.all([
    getProjects(locale),
    getSectionsMap(locale),
  ]);

  return (
    <>
      <PageHeader
        kicker={t.pageHeaders.realisations.kicker}
        title={t.pageHeaders.realisations.title}
        lede={t.pageHeaders.realisations.lede}
        image="/images/code-macro.jpg"
      />
      <Travaux head={sections.travaux} projects={projects} hideHead locale={locale} />
      <ContactCta locale={locale} />
    </>
  );
}
