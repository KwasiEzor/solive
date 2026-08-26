import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getProjects } from "@/server/queries/content";

// SLV-102: generated from the DB, with language alternates (SLV-104).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = env.NEXT_PUBLIC_SITE_URL;
  // Resilient: never fail the build/response if the DB is briefly unreachable.
  const [projectsFr, projectsEn] = await Promise.all([
    getProjects("fr").catch(() => []),
    getProjects("en").catch(() => []),
  ]);

  const STATIC = [
    "/",
    "/services",
    "/ia",
    "/realisations",
    "/pourquoi-solive",
    "/tarifs",
    "/contact",
    "/mentions-legales",
    "/confidentialite",
    "/cookies",
  ] as const;
  const PRIORITY: Record<(typeof STATIC)[number], number> = {
    "/": 1,
    "/services": 0.9,
    "/ia": 0.9,
    "/realisations": 0.8,
    "/pourquoi-solive": 0.7,
    "/tarifs": 0.8,
    "/contact": 0.7,
    "/mentions-legales": 0.2,
    "/confidentialite": 0.2,
    "/cookies": 0.2,
  };
  const FREQ: Record<(typeof STATIC)[number], MetadataRoute.Sitemap[number]["changeFrequency"]> = {
    "/": "weekly",
    "/services": "monthly",
    "/ia": "monthly",
    "/realisations": "monthly",
    "/pourquoi-solive": "monthly",
    "/tarifs": "monthly",
    "/contact": "yearly",
    "/mentions-legales": "yearly",
    "/confidentialite": "yearly",
    "/cookies": "yearly",
  };

  const enUrl = (path: string) => `${site}/en${path === "/" ? "" : path}`;

  const staticEntries: MetadataRoute.Sitemap = STATIC.flatMap((path) => [
    {
      url: `${site}${path}`,
      changeFrequency: FREQ[path],
      priority: PRIORITY[path],
      alternates: { languages: { fr: `${site}${path}`, en: enUrl(path) } },
    },
    {
      url: enUrl(path),
      changeFrequency: FREQ[path],
      priority: PRIORITY[path],
      alternates: { languages: { fr: `${site}${path}`, en: enUrl(path) } },
    },
  ]);

  const enSlugs = new Set(projectsEn.map((p) => p.slug));
  const projectEntries: MetadataRoute.Sitemap = projectsFr.flatMap((p) => {
    const frUrl = `${site}/travaux/${p.slug}`;
    const hasEn = enSlugs.has(p.slug);
    const entries: MetadataRoute.Sitemap = [
      {
        url: frUrl,
        lastModified: p.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: hasEn
          ? { languages: { fr: frUrl, en: `${site}/en/travaux/${p.slug}` } }
          : undefined,
      },
    ];
    if (hasEn) {
      entries.push({
        url: `${site}/en/travaux/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly",
        priority: 0.6,
        alternates: { languages: { fr: frUrl, en: `${site}/en/travaux/${p.slug}` } },
      });
    }
    return entries;
  });

  return [...staticEntries, ...projectEntries];
}
