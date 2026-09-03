import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CountUp } from "@/components/site/count-up";
import { ContactCta } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getRequestLocale } from "@/lib/i18n/locale";
import { localizedPath } from "@/lib/i18n/urls";
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

/**
 * Not every project necessarily has an English case study yet — fall back to
 * the French row rather than 404ing an otherwise-real, published project.
 */
async function loadProject(slug: string, locale: "fr" | "en") {
  const project = await getProjectBySlug(slug, locale);
  if (project) return project;
  if (locale === "fr") return null;
  return getProjectBySlug(slug, "fr");
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const project = await loadProject(slug, locale);
  if (!project) return {};
  const site = env.NEXT_PUBLIC_SITE_URL;
  return {
    title: project.metaTitle ?? project.title,
    description: project.metaDescription ?? undefined,
    alternates: {
      canonical: `${site}${localizedPath(`/travaux/${slug}`, locale)}`,
      languages: {
        fr: `${site}/travaux/${slug}`,
        en: `${site}/en/travaux/${slug}`,
      },
    },
  };
}

export default async function CaseStudyPage({ params }: Params) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const t = getDictionary(locale).caseStudy;
  const project = await loadProject(slug, locale);
  if (!project) notFound();

  const paragraphs = bodyParagraphs(project.body);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    about: project.sector ?? undefined,
    keywords: project.stack.join(", "),
    inLanguage: locale,
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
                <dt>{t.client}</dt>
                <dd>{project.clientName}</dd>
              </div>
            )}
            {project.metricValue && (
              <div>
                <dt>{t.result}</dt>
                <dd className="case-facts-metric">
                  <CountUp value={project.metricValue} />
                  {project.metricLabel ? ` ${project.metricLabel}` : ""}
                </dd>
              </div>
            )}
            {project.stack.length > 0 && (
              <div>
                <dt>{t.stack}</dt>
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
            <p className="dim">{t.emptyBody}</p>
          )}
          <p style={{ marginTop: 36 }}>
            <Link href={localizedPath("/realisations", locale)} className="btn ghost">
              {t.backToList}
            </Link>
          </p>
        </div>
      </article>
      <ContactCta locale={locale} />
    </>
  );
}
