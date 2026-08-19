import { OG_CONTENT_TYPE, OG_SIZE, renderOg } from "@/lib/og";
import { getProjectBySlug } from "@/server/queries/content";

export const alt = "Étude de cas — Solive";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  const metric = project?.metricValue
    ? `${project.metricValue}${project.metricLabel ? ` ${project.metricLabel}` : ""}`
    : "Devis fixe · Calendrier daté · Code livré";
  return renderOg({
    eyebrow: project?.sector ?? "Réalisation",
    title: project?.title ?? "Étude de cas",
    footer: metric,
  });
}
