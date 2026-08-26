import type { Metadata } from "next";
import { Contact } from "@/components/site/contact";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
import { getSiteSettings } from "@/server/queries/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.contact;
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: t.title,
    description: t.description,
    alternates: {
      canonical: `${site}${localizedPath("/contact", locale)}`,
      languages: { fr: `${site}/contact`, en: `${site}/en/contact` },
    },
  };
}

export default async function ContactPage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader
        kicker={t.pageHeaders.contact.kicker}
        title={t.pageHeaders.contact.title}
        lede={t.pageHeaders.contact.lede}
        image="/images/server.jpg"
      />
      <Contact email={settings?.email ?? undefined} hideHead locale={locale} />
    </>
  );
}
