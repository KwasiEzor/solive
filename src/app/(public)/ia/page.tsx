import type { Metadata } from "next";
import {
  IaAssistantTeaser,
  IaDifferentiators,
  IaFaq,
  IaMethod,
  IaPricing,
  IaUseCases,
} from "@/components/site/ia";
import { MediaBand } from "@/components/site/sections";
import { ContactCta, PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.ia;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/ia", locale)}`,
      languages: { fr: `${site}/ia`, en: `${site}/en/ia` },
    },
  };
}

export default async function IaPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: t.ia.serviceType,
    provider: { "@type": "LocalBusiness", name: "Solive" },
    areaServed: ["BE", "FR", "LU"],
    description: t.ia.jsonLdDescription,
    inLanguage: locale,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        kicker={t.pageHeaders.ia.kicker}
        title={t.pageHeaders.ia.title}
        lede={t.pageHeaders.ia.lede}
        image="/images/terminal.jpg"
      />
      <IaDifferentiators locale={locale} />
      <MediaBand src="/images/ai-data.jpg" caption={t.iaPage.mediaBandCaption} />
      <IaUseCases locale={locale} />
      <IaMethod locale={locale} />
      <IaPricing locale={locale} />
      <IaAssistantTeaser locale={locale} />
      <IaFaq locale={locale} />
      <ContactCta locale={locale} title={t.contactCta.ia.title} text={t.contactCta.ia.text} />
    </>
  );
}
