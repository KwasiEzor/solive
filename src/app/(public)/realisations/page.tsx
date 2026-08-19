import type { Metadata } from "next";
import { Travaux } from "@/components/site/sections";
import { ContactCta, PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getProjects, getSectionsMap } from "@/server/queries/content";

export const metadata: Metadata = {
  title: "Réalisations — études de cas",
  description:
    "Sites, outils métier et applications mobiles livrés pour des artisans, PME et startups en Belgique, France et Luxembourg.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/realisations` },
};

export default async function RealisationsPage() {
  const [projects, sections] = await Promise.all([
    getProjects("fr"),
    getSectionsMap("fr"),
  ]);

  return (
    <>
      <PageHeader
        kicker="Réalisations"
        title="Ce que ça donne une fois livré."
        lede="Des projets concrets, des résultats mesurés. Cliquez pour le détail de chaque étude de cas."
        image="/images/code-macro.jpg"
      />
      <Travaux head={sections.travaux} projects={projects} hideHead />
      <ContactCta />
    </>
  );
}
