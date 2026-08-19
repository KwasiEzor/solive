import type { Metadata } from "next";
import { Methode, Services } from "@/components/site/sections";
import { ContactCta, PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import {
  getProcessSteps,
  getSectionsMap,
  getServices,
} from "@/server/queries/content";

export const metadata: Metadata = {
  title: "Services — sites, applications web & mobiles",
  description:
    "Sites vitrines et refontes, applications web métier sur mesure, applications mobiles iOS et Android. Une méthode en quatre étapes, un devis fixe.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/services` },
};

export default async function ServicesPage() {
  const [services, steps, sections] = await Promise.all([
    getServices("fr"),
    getProcessSteps("fr"),
    getSectionsMap("fr"),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
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
        kicker="Services"
        title="Ce qu’on fabrique, de bout en bout."
        lede="Du site vitrine à l’application métier, un seul studio conçoit, développe et livre — avec un devis fixe et un calendrier daté."
        image="/images/terminal.jpg"
      />
      <Services head={sections.services} items={services} hideHead />
      <Methode head={sections.methode} steps={steps} />
      <ContactCta />
    </>
  );
}
