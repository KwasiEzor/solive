import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import "./globals.css";

// Self-hosted at build by next/font (no runtime Google requests, SLV-094).
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "700", "800"],
  display: "swap",
});
const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
});
const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Solive — studio de développement à Bruxelles",
    template: "%s · Solive",
  },
  description:
    "Studio de développement à Bruxelles : sites vitrines, applications web métier et applications mobiles. Devis fixe, calendrier daté, code livré à votre nom.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Read a request header so pages render per-request: the middleware's CSP
  // nonce is then applied to Next's scripts (SLV-051). A per-request nonce is
  // incompatible with static prerendering — see ADR-0006.
  await headers();
  return (
    <html
      lang="fr"
      className={`t-ardoise ${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
