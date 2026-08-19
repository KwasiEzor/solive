import type { Metadata } from "next";
import { Contact } from "@/components/site/contact";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/server/queries/content";

export const metadata: Metadata = {
  title: "Contact — parlons de votre projet",
  description:
    "Décrivez votre projet en quelques lignes. Réponse sous 24 h ouvrées, avec des questions et une proposition de créneau.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/contact` },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader
        kicker="Contact"
        title="Dites-moi ce que vous voulez construire."
        lede="Un appel de 20 minutes, un devis fixe, un calendrier daté. Réponse sous 24 h ouvrées."
        image="/images/server.jpg"
      />
      <Contact email={settings?.email ?? undefined} hideHead />
    </>
  );
}
