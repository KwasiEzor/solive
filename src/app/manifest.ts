import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/server/queries/content";

const THEME: Record<string, string> = {
  chaux: "#f7f6f2",
  ardoise: "#0a0c10",
  cobalt: "#0a1020",
};

// Web app manifest (SLV-080). theme_color follows the active palette.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = await getSiteSettings().catch(() => null);
  const palette = settings?.activePalette ?? "ardoise";
  const color = THEME[palette] ?? THEME.ardoise;

  return {
    name: "Solive — studio de développement",
    short_name: "Solive",
    description:
      "Sites vitrines, applications web métier et applications mobiles.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: color,
    theme_color: color,
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      {
        src: "/icon-maskable.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
