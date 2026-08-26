import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { headers } from "next/headers";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
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

// /admin, /api, /connexion etc. never get the /en rewrite (proxy.ts only
// matches literal /en paths), so this stays French for them — intentional,
// matches the locked i18n scope (public site only).
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = getDictionary(locale).meta.root;
  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: t.title, template: "%s · Solive" },
    description: t.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Read a request header so pages render per-request: the proxy's CSP
  // nonce is then applied to Next's scripts (SLV-051). A per-request nonce is
  // incompatible with static prerendering — see ADR-0006. This also lets us
  // resolve the /en-rewritten locale (SLV i18n) safely below.
  await headers();
  const locale = await getRequestLocale();
  return (
    <html
      lang={locale}
      className={`t-ardoise ${display.variable} ${sans.variable} ${mono.variable} h-full`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
