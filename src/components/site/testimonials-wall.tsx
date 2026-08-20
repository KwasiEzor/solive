"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Testimonial } from "@/server/db/types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Stars({ n }: { n: number }) {
  const full = Math.max(0, Math.min(5, n));
  return (
    <span className="stars" aria-label={`${full} sur 5`}>
      {"★★★★★".slice(0, full)}
      <span className="stars-empty">{"★★★★★".slice(full)}</span>
    </span>
  );
}

function Card({ t, dup }: { t: Testimonial; dup?: boolean }) {
  return (
    <figure className="quote wall-card" aria-hidden={dup || undefined}>
      {typeof t.rating === "number" && <Stars n={t.rating} />}
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
          href={`/travaux/${t.projectSlug}`}
          className="stretched-link"
          aria-label={`Étude de cas liée à l’avis de ${t.author}`}
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
export function TestimonialsWall({ items }: { items: Testimonial[] }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = requestAnimationFrame(() => setPaused(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className={"wall" + (paused ? " is-paused" : "")}>
      <div className="wall-viewport">
        <div className="wall-track">
          {items.map((t) => (
            <Card key={t.id} t={t} />
          ))}
          {items.map((t) => (
            <Card key={`dup-${t.id}`} t={t} dup />
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
          {paused ? "▶ Reprendre le défilement" : "❚❚ Mettre en pause"}
        </button>
      </div>
    </div>
  );
}
