import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import {
  WhyFounder,
  WhySkills,
  WhyValues,
  WhyVision,
} from "@/components/site/why-solive";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Pourquoi Solive",
  description:
    "Un atelier d'une personne, par choix. Ce que Solive défend, ce qu'on sait faire, et pourquoi rester petit garde la relation honnête.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/pourquoi-solive` },
};

export default function PourquoiSolivePage() {
  return (
    <>
      <PageHeader
        kicker="Pourquoi Solive"
        title="Un atelier d’une personne. C’est un choix, pas une contrainte."
        lede="Pas de chef de projet, pas de commercial, pas de sous-traitance invisible. Voici ce qu'on défend, ce qu'on sait faire, et pourquoi ça reste ainsi."
        image="/images/dev-desk.jpg"
      />
      <WhyFounder />
      <WhyValues />
      <WhySkills />
      <WhyVision />
    </>
  );
}
