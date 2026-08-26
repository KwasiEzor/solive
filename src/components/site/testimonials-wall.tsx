"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/urls";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";
import type { Testimonial } from "@/server/db/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Stars({ n, ariaLabel }: { n: number; ariaLabel: string }) {
  const full = Math.max(0, Math.min(5, n));
  return (
    <span className="stars" aria-label={ariaLabel}>
      {"★★★★★".slice(0, full)}
      <span className="stars-empty">{"★★★★★".slice(full)}</span>
    </span>
  );
}

function Card({
  t,
  dup,
  locale,
  starsAria,
  caseStudyAria,
}: {
  t: Testimonial;
  dup?: boolean;
  locale: Locale;
  starsAria: (n: number) => string;
  caseStudyAria: (author: string) => string;
}) {
  return (
    <figure className="quote wall-card" aria-hidden={dup || undefined}>
      {typeof t.rating === "number" && <Stars n={t.rating} ariaLabel={starsAria(t.rating)} />}
      <blockquote>{t.quote}</blockquote>
      <figcaption className="quote-by">
        <span className="quote-avatar" aria-hidden="true">
          {initials(t.author)}
        </span>
        <span>
          <strong>{t.author}</strong>
          <span className="mono tiny dim">
            {[t.role, t.company, t.sector].filter(Boolean).join(" · ")}
          </span>
        </span>
      </figcaption>
      {t.projectSlug && !dup && (
        <Link
          href={localizedPath(`/travaux/${t.projectSlug}`, locale)}
          className="stretched-link"
          aria-label={caseStudyAria(t.author)}
        />
      )}
    </figure>
  );
}

/**
 * Auto-scrolling testimonial wall (marquee). Accessible per WCAG 2.2.2:
 * visible keyboard-operable pause/play, pauses on hover/focus, and defaults
 * to paused under prefers-reduced-motion. The duplicated set is aria-hidden.
 */
export function TestimonialsWall({ items, locale }: { items: Testimonial[]; locale: Locale }) {
  const [paused, setPaused] = useState(false);
  const t = getDictionary(locale).testimonialsWall;

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = requestAnimationFrame(() => setPaused(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={"wall" + (paused ? " is-paused" : "")}>
      <div className="wall-viewport">
        <div className="wall-track">
          {items.map((item) => (
            <Card key={item.id} t={item} locale={locale} starsAria={t.starsAria} caseStudyAria={t.caseStudyAria} />
          ))}
          {items.map((item) => (
            <Card key={`dup-${item.id}`} t={item} dup locale={locale} starsAria={t.starsAria} caseStudyAria={t.caseStudyAria} />
          ))}
        </div>
      </div>
      <div className="wall-controls">
        <button
          type="button"
          className="wall-toggle mono tiny"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
        >
          {paused ? t.resume : t.pause}
        </button>
      </div>
    </div>
  );
}
