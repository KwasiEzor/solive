import { Faq } from "@/components/site/faq";
import {
  Hero,
  Methode,
  Services,
  Tarifs,
  Ticker,
  Travaux,
} from "@/components/site/sections";
import { ContactCta } from "@/components/site/subpage";
import { env } from "@/lib/env";
import {
  getFaqItems,
  getPricingPlans,
  getProcessSteps,
  getProjects,
  getSectionsMap,
  getServices,
  getSiteSettings,
} from "@/server/queries/content";

export default async function HomePage() {
  const [settings, sections, services, steps, projects, plans, faqs] =
    await Promise.all([
      getSiteSettings(),
      getSectionsMap("fr"),
      getServices("fr"),
      getProcessSteps("fr"),
      getProjects("fr"),
      getPricingPlans("fr"),
      getFaqItems("fr"),
    ]);

  const site = env.NEXT_PUBLIC_SITE_URL;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${site}#studio`,
        name: settings?.name ?? "Solive",
        description: settings?.baseline ?? "studio de développement",
        email: settings?.email ?? "bonjour@solive.pro",
        url: site,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bruxelles",
          addressCountry: "BE",
        },
        areaServed: ["BE", "FR", "LU"],
        vatID: settings?.vat ?? undefined,
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
      <Hero section={sections.hero} />
      <Ticker />
      <Services head={sections.services} items={services} />
      <Methode head={sections.methode} steps={steps} />
      <Travaux head={sections.travaux} projects={projects} />
      <Tarifs head={sections.tarifs} plans={plans} />
      <Faq head={sections.faq} items={faqs} />
      <ContactCta />
    </>
  );
}
