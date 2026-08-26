import type { Metadata } from "next";
import { Faq } from "@/components/site/faq";
import { Tarifs } from "@/components/site/sections";
import {
  ContactCta,
  PageHeader,
  PricingReassurance,
} from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
import {
  getFaqItems,
  getPricingPlans,
  getSectionsMap,
} from "@/server/queries/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.tarifs;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/tarifs", locale)}`,
      languages: { fr: `${site}/tarifs`, en: `${site}/en/tarifs` },
    },
  };
}

export default async function TarifsPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const [plans, faqs, sections] = await Promise.all([
    getPricingPlans(locale),
    getFaqItems(locale),
    getSectionsMap(locale),
  ]);

  return (
    <>
      <PageHeader
        kicker={t.pageHeaders.tarifs.kicker}
        title={t.pageHeaders.tarifs.title}
        lede={t.pageHeaders.tarifs.lede}
        image="/images/circuit.jpg"
      />
      <Tarifs head={sections.tarifs} plans={plans} hideHead locale={locale} />
      <PricingReassurance locale={locale} />
      <Faq head={sections.faq} items={faqs} locale={locale} />
      <ContactCta locale={locale} />
    </>
  );
}
