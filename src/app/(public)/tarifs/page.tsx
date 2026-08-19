import type { Metadata } from "next";
import { Faq } from "@/components/site/faq";
import { Tarifs } from "@/components/site/sections";
import {
  ContactCta,
  PageHeader,
  PricingReassurance,
} from "@/components/site/subpage";
import { env } from "@/lib/env";
import {
  getFaqItems,
  getPricingPlans,
  getSectionsMap,
} from "@/server/queries/content";

export const metadata: Metadata = {
  title: "Tarifs — devis fixe, calendrier daté",
  description:
    "Les ordres de grandeur avant même de s’appeler : site vitrine, application web, application mobile. Devis fixe, sans rallonge.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/tarifs` },
};

export default async function TarifsPage() {
  const [plans, faqs, sections] = await Promise.all([
    getPricingPlans("fr"),
    getFaqItems("fr"),
    getSectionsMap("fr"),
  ]);

  return (
    <>
      <PageHeader
        kicker="Tarifs"
        title="Les ordres de grandeur, avant même de s’appeler."
        lede="Un devis fixe pour le périmètre écrit. Pas de rallonge surprise : tout ajout est chiffré à part, et vous décidez."
        image="/images/circuit.jpg"
      />
      <Tarifs head={sections.tarifs} plans={plans} hideHead />
      <PricingReassurance />
      <Faq head={sections.faq} items={faqs} />
      <ContactCta />
    </>
  );
}
