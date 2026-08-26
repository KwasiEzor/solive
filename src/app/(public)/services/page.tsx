import type { Metadata } from "next";
import { Methode, Services } from "@/components/site/sections";
import { ContactCta, PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
import {
  getProcessSteps,
  getSectionsMap,
  getServices,
} from "@/server/queries/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.services;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/services", locale)}`,
      languages: { fr: `${site}/services`, en: `${site}/en/services` },
    },
  };
}

export default async function ServicesPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const [services, steps, sections] = await Promise.all([
    getServices(locale),
    getProcessSteps(locale),
    getSectionsMap(locale),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    inLanguage: locale,
    itemListElement: services.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: { "@type": "Service", name: s.title, description: s.summary ?? undefined },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        kicker={t.pageHeaders.services.kicker}
        title={t.pageHeaders.services.title}
        lede={t.pageHeaders.services.lede}
        image="/images/terminal.jpg"
      />
      <Services head={sections.services} items={services} hideHead locale={locale} />
      <Methode head={sections.methode} steps={steps} locale={locale} />
      <ContactCta locale={locale} />
    </>
  );
}
