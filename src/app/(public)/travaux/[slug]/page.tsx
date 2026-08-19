import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { env } from "@/lib/env";
import { getProjectBySlug } from "@/server/queries/content";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.metaTitle ?? project.title,
    description: project.metaDescription ?? undefined,
    alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/travaux/${slug}` },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    about: project.sector ?? undefined,
    keywords: project.stack.join(", "),
  };

  return (
    <section className="sec">
      <div className="wrap narrow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {project.sector && (
          <span className="mono tiny eyebrow">{project.sector.toUpperCase()}</span>
        )}
        <h1 style={{ fontSize: "clamp(2rem,4vw,3.2rem)", marginTop: 12 }}>
          {project.title}
        </h1>
        {project.metricValue && (
          <p className="case-num" style={{ marginTop: 24 }}>
            {project.metricValue}
          </p>
        )}
        {project.metricLabel && <p className="case-leg">{project.metricLabel}</p>}
        {project.stack.length > 0 && (
          <p className="mono tiny dim" style={{ marginTop: 24 }}>
            {project.stack.join(" · ")}
          </p>
        )}
        <p style={{ marginTop: 40 }}>
          <Link href="/#travaux" className="btn ghost">
            ← Retour aux travaux
          </Link>
        </p>
      </div>
    </section>
  );
}
