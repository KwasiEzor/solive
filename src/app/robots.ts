import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// SLV-102: disallow /admin and /api.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/connexion", "/mfa", "/reinitialiser"],
    },
    sitemap: `${env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
    host: env.NEXT_PUBLIC_SITE_URL,
  };
}
