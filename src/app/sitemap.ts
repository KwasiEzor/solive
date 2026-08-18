import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { getProjects } from "@/server/queries/content";

// SLV-102: generated from the DB, with language alternates (SLV-104).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = env.NEXT_PUBLIC_SITE_URL;
  const projects = await getProjects("fr");

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/mentions-legales`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${site}/confidentialite`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${site}/travaux/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticPages, ...projectPages];
}
