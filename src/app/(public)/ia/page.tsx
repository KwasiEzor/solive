import type { Metadata } from "next";
import {
  IaAssistantTeaser,
  IaDifferentiators,
  IaFaq,
  IaMethod,
  IaPricing,
  IaUseCases,
} from "@/components/site/ia";
import { ContactCta, PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "IA & agents — assistants souverains, sans lock-in",
  description:
    "Assistants clients, agents de qualification et automatisations métier. Une IA hébergée en Europe, sourcée, mesurée, que vous possédez — pas un wrapper ChatGPT de plus.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/ia` },
};

export default function IaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Intelligence artificielle — assistants et agents",
    provider: { "@type": "LocalBusiness", name: "Solive" },
    areaServed: ["BE", "FR", "LU"],
    description:
      "Assistants IA (RAG), agents de qualification, automatisations métier. Hébergé en Europe, sans lock-in, garde-fous et évals.",
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageHeader
        kicker="Intelligence artificielle"
        title="Une IA qui tient debout — pas un wrapper de plus."
        lede="Assistants clients, agents de qualification, automatisations métier. Hébergée en Europe, sourcée, mesurée, sans lock-in. Vous la possédez."
        image="/images/terminal.jpg"
      />
      <IaDifferentiators />
      <IaUseCases />
      <IaMethod />
      <IaPricing />
      <IaAssistantTeaser />
      <IaFaq />
      <ContactCta
        title="Un cas d’usage IA en tête ?"
        text="On commence par un audit court : ce qui est automatisable chez vous, le ROI, la feuille de route. Puis un devis fixe."
      />
    </>
  );
}
