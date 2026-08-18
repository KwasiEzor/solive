import type { Metadata } from "next";
import { LegalContent } from "@/components/site/legal";

export const metadata: Metadata = { title: "Mentions légales" };

export default function MentionsLegalesPage() {
  return <LegalContent slug="mentions-legales" fallbackTitle="Mentions légales" />;
}
