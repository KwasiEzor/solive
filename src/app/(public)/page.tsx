import type { Metadata } from "next";
import { Faq } from "@/components/site/faq";
import {
  Hero,
  MediaBand,
  Methode,
  Services,
  Tarifs,
  Testimonials,
  Ticker,
  Travaux,
} from "@/components/site/sections";
import { IaHomeTeaser } from "@/components/site/ia";
import { ContactCta } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
import {
  getFaqItems,
  getPricingPlans,
  getProcessSteps,
  getProjects,
  getSectionsMap,
  getServices,
  getSiteSettings,
  getTestimonials,
} from "@/server/queries/content";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const site = env.NEXT_PUBLIC_SITE_URL;
  // No title/description here on purpose: the root layout's own
  // generateMetadata is already locale-aware and supplies the `default`
  // title directly (not template-wrapped) — setting one here would stack a
  // redundant "· Solive" suffix on top of it.
  return {
    alternates: {
      canonical: `${site}${localizedPath("/", locale)}`,
      languages: { fr: `${site}/`, en: `${site}/en` },
    },
  };
}

export default async function HomePage() {
  const locale = await getRequestLocale();
  const t = getDictionary(locale);
  const [settings, sections, services, steps, projects, plans, faqs, quotes] =
    await Promise.all([
      getSiteSettings(),
      getSectionsMap(locale),
      getServices(locale),
      getProcessSteps(locale),
      getProjects(locale),
      getPricingPlans(locale),
      getFaqItems(locale),
      getTestimonials(locale),
    ]);

  const site = env.NEXT_PUBLIC_SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${site}#studio`,
        name: settings?.name ?? "Solive",
        description: (locale === "fr" ? settings?.baseline : null) ?? t.common.baseline,
        email: settings?.email ?? "bonjour@solive.pro",
        url: site,
        address: {
          "@type": "PostalAddress",
          addressLocality: t.common.ville,
          addressCountry: "BE",
        },
        areaServed: ["BE", "FR", "LU"],
        vatID: settings?.vat ?? undefined,
        inLanguage: locale,
      },
      ...services.map((s) => ({
        "@type": "Service",
        name: s.title,
        description: s.summary ?? undefined,
        provider: { "@id": `${site}#studio` },
      })),
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: {
            "@type": "Answer",
            text:
              typeof f.answer === "string"
                ? f.answer
                : JSON.stringify(f.answer),
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // JSON-LD is data, not executable; safe to inline.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero section={sections.hero} locale={locale} />
      <Ticker locale={locale} />
      <Services head={sections.services} items={services} locale={locale} />
      <IaHomeTeaser locale={locale} />
      <Methode head={sections.methode} steps={steps} locale={locale} />
      <MediaBand src="/images/dev-desk.jpg" caption={t.home.mediaBandCaption} />
      <Travaux head={sections.travaux} projects={projects} locale={locale} />
      <Testimonials head={sections.temoignages} items={quotes} locale={locale} />
      <Tarifs head={sections.tarifs} plans={plans} locale={locale} />
      <Faq head={sections.faq} items={faqs} locale={locale} />
      <ContactCta locale={locale} />
    </>
  );
}
