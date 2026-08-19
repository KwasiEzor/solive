import type { ReactNode } from "react";
import { Nav } from "@/components/site/nav";
import { NetworkStatus } from "@/components/site/network-status";
import { Footer } from "@/components/site/sections";
import { SwUpdatePrompt } from "@/components/site/sw-update";
import { getSiteSettings } from "@/server/queries/content";
import "@/styles/site.css";

export default async function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const settings = await getSiteSettings();
  const palette = settings?.activePalette ?? "ardoise";
  const brand = (settings?.name ?? "SOLIVE").toUpperCase();

  return (
    <div className={`site t-${palette}`}>
      <a href="#main" className="skip">
        Aller au contenu
      </a>
      <Nav brand={brand} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <NetworkStatus />
      <SwUpdatePrompt />
    </div>
  );
}
