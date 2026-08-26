import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import {
  WhyFounder,
  WhySkills,
  WhyValues,
  WhyVision,
} from "@/components/site/why-solive";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.pourquoiSolive;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/pourquoi-solive", locale)}`,
      languages: { fr: `${site}/pourquoi-solive`, en: `${site}/en/pourquoi-solive` },
    },
  };
}

export default async function PourquoiSolivePage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  return (
    <>
      <PageHeader
        kicker={t.pageHeaders.pourquoiSolive.kicker}
        title={t.pageHeaders.pourquoiSolive.title}
        lede={t.pageHeaders.pourquoiSolive.lede}
        image="/images/dev-desk.jpg"
      />
      <WhyFounder locale={locale} />
      <WhyValues locale={locale} />
      <WhySkills locale={locale} />
      <WhyVision locale={locale} />
    </>
  );
}
