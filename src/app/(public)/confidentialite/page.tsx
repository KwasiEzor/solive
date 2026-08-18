import type { Metadata } from "next";
import { LegalContent } from "@/components/site/legal";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function ConfidentialitePage() {
  return (
    <LegalContent slug="confidentialite" fallbackTitle="Confidentialité" />
  );
}
