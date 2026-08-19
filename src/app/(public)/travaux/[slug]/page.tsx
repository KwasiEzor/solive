import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountUp } from "@/components/site/count-up";
import { ContactCta } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getProjectBySlug } from "@/server/queries/content";

type Params = { params: Promise<{ slug: string }> };

const COVERS = [
  "/images/code-screen.jpg",
  "/images/code-macro.jpg",
  "/images/dev-desk.jpg",
  "/images/mobile-app.jpg",
  "/images/terminal.jpg",
  "/images/circuit.jpg",
];

/** Deterministic cover per slug (until a real coverMedia is set). */
function coverFor(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return COVERS[h % COVERS.length]!;
}

/** Render a jsonb `body` defensively: string, string[], or {text} blocks. */
function bodyParagraphs(body: unknown): string[] {
  if (!body) return [];
  if (typeof body === "string") return body.split(/\n\s*\n/).filter(Boolean);
  if (Array.isArray(body)) {
    return body
      .map((b) =>
        typeof b === "string"
          ? b
          : b && typeof b === "object" && "text" in b
            ? String((b as { text: unknown }).text)
            : "",
      )
      .filter(Boolean);
  }
  return [];
}

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

  const paragraphs = bodyParagraphs(project.body);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    about: project.sector ?? undefined,
    keywords: project.stack.join(", "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="case-study">
        <header className="wrap narrow case-study-head">
          {project.sector && (
            <span className="mono tiny eyebrow">
              {project.sector.toUpperCase()}
            </span>
          )}
          <h1>{project.title}</h1>
          <dl className="case-facts mono tiny">
            {project.clientName && (
              <div>
                <dt>Client</dt>
                <dd>{project.clientName}</dd>
              </div>
            )}
            {project.metricValue && (
              <div>
                <dt>Résultat</dt>
                <dd className="case-facts-metric">
                  <CountUp value={project.metricValue} />
                  {project.metricLabel ? ` ${project.metricLabel}` : ""}
                </dd>
              </div>
            )}
            {project.stack.length > 0 && (
              <div>
                <dt>Stack</dt>
                <dd>{project.stack.join(" · ")}</dd>
              </div>
            )}
          </dl>
        </header>

        <div className="wrap">
          <div className="case-cover">
            <Image
              src={coverFor(slug)}
              alt=""
              fill
              sizes="(max-width: 960px) 100vw, 960px"
              priority
              aria-hidden="true"
            />
          </div>
        </div>

        <div className="wrap narrow case-study-body">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => <p key={i}>{p}</p>)
          ) : (
            <p className="dim">
              Étude de cas détaillée en cours de rédaction. En attendant,
              parlons de votre projet — je vous montre des exemples proches lors
              de l’appel.
            </p>
          )}
          <p style={{ marginTop: 36 }}>
            <Link href="/realisations" className="btn ghost">
              ← Toutes les réalisations
            </Link>
          </p>
        </div>
      </article>
      <ContactCta />
    </>
  );
}
