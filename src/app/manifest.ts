import type { MetadataRoute } from "next";

// SLV-080: web manifest. Icons are added in Phase 7 (PWA).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Solive — studio de développement",
    short_name: "Solive",
    description:
      "Sites vitrines, applications web métier et applications mobiles.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#e9eae4",
    theme_color: "#0f5c43",
    lang: "fr",
    icons: [],
  };
}
