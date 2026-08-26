import type { ReactNode } from "react";
import { AnalyticsBeacon } from "@/components/site/analytics-beacon";
import { ConsentBanner } from "@/components/site/consent-banner";
import { FloatCta } from "@/components/site/float-cta";
import { Nav } from "@/components/site/nav";
import { NetworkStatus } from "@/components/site/network-status";
import { ScrollTop } from "@/components/site/scroll-top";
import { Footer } from "@/components/site/sections";
import { SwUpdatePrompt } from "@/components/site/sw-update";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { getSiteSettings } from "@/server/queries/content";
import "@/styles/site.css";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [settings, locale] = await Promise.all([getSiteSettings(), getRequestLocale()]);
  const palette = settings?.activePalette ?? "ardoise";
  const brand = (settings?.name ?? "SOLIVE").toUpperCase();
  const t = getDictionary(locale);

  return (
    <div className={`site t-${palette}`}>
      <a href="#main" className="skip">
        {t.common.skipLink}
      </a>
      <Nav brand={brand} locale={locale} />
      <main id="main">{children}</main>
      <Footer settings={settings} locale={locale} />
      <NetworkStatus locale={locale} />
      <SwUpdatePrompt locale={locale} />
      <ScrollTop locale={locale} />
      <FloatCta locale={locale} />
      <ConsentBanner locale={locale} />
      <AnalyticsBeacon />
    </div>
  );
}
