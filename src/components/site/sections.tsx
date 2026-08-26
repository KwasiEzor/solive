import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/urls";
import type {
  PricingPlan,
  ProcessStep,
  Project,
  Section,
  Service,
  SiteSettings,
  Testimonial,
} from "@/server/db/types";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";
import { CountUp } from "./count-up";
import { HeroStructure } from "./hero-structure";
import { LangSwitch } from "./lang-switch";
import { PlanCycle } from "./plan-cycle";
import { Reveal } from "./reveal";
import { TestimonialsWall } from "./testimonials-wall";
import { Mark, Tick } from "./icons";

/** Tech cover images cycled across case studies (no people — solo studio). */
const CASE_IMAGES = [
  "/images/code-screen.jpg",
  "/images/mobile-app.jpg",
  "/images/dev-desk.jpg",
  "/images/code-macro.jpg",
  "/images/terminal.jpg",
  "/images/circuit.jpg",
];

/** Cover per service lot: vitrine → code, app web → IDE, mobile → device. */
const SERVICE_IMAGES = [
  "/images/code-screen.jpg",
  "/images/code-macro.jpg",
  "/images/mobile-app.jpg",
  "/images/terminal.jpg",
];

/** Full-width scrimmed image band. */
export function MediaBand({
  src,
  caption,
  priority,
}: {
  src: string;
  caption: string;
  priority?: boolean;
}) {
  return (
    <div className="media-band">
      <Image
        src={src}
        alt=""
        fill
        sizes="100vw"
        priority={priority}
        aria-hidden="true"
      />
      <p className="band-cap">{caption}</p>
    </div>
  );
}

const HL_FR = "solide";
const HL_EN = "strong";

export function SecHead({ kicker, titre }: { kicker: string; titre: string }) {
  return (
    <div className="sec-head">
      {kicker && <span className="mono tiny eyebrow">{kicker.toUpperCase()}</span>}
      <h2>{titre}</h2>
    </div>
  );
}

export function Hero({ section, locale }: { section?: Section; locale: Locale }) {
  const t = getDictionary(locale);
  const hl = locale === "en" ? HL_EN : HL_FR;
  const heading = section?.heading ?? (locale === "en" ? "We build strong." : "On construit solide.");
  const kicker = section?.kicker ?? `${t.common.baseline} — ${t.common.ville}`;
  const idx = heading.indexOf(hl);
  const before = idx >= 0 ? heading.slice(0, idx) : heading;
  const after = idx >= 0 ? heading.slice(idx + hl.length) : "";

  return (
    <section id="top" className="hero">
      <div className="hero-media">
        <HeroStructure />
      </div>
      <div className="wrap hero-in">
        <div className="hero-copy">
          <div className="hero-tags">
            <span className="mono tiny eyebrow">{kicker.toUpperCase()}</span>
            <span className="hero-tag mono tiny">{t.hero.buildStrong}</span>
          </div>
          <h1>
            {before}
            {idx >= 0 && <span className="hl">{hl}</span>}
            {after}
          </h1>
          <p className="lede">{t.hero.lede}</p>
          <div className="hero-cta">
            <Link href={localizedPath("/contact", locale)} className="btn">
              {t.hero.ctaPrimary}
            </Link>
            <Link href={localizedPath("/services", locale)} className="btn ghost">
              {t.hero.ctaSecondary}
            </Link>
          </div>
          <ul className="hero-facts mono tiny">
            {t.hero.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="hero-plan">
          <PlanCycle locale={locale} />
        </div>
      </div>
    </section>
  );
}

export function Ticker({ locale }: { locale: Locale }) {
  const items = getDictionary(locale).ticker.items;
  const row = [...items, ...items];
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker-row">
        {row.map((t, i) => (
          <span key={i} className="mono tiny">
            {t}
            <i>◆</i>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Services({
  head,
  items,
  hideHead,
  locale,
}: {
  head?: Section;
  items: Service[];
  hideHead?: boolean;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <section id="services" className="sec">
      <div className="wrap">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? t.sectionsFallback.services.kicker}
            titre={head?.heading ?? t.sectionsFallback.services.titre}
          />
        )}
        <div className="grid3">
          {items.map((s, i) => (
            <Reveal key={s.id} as="article" className="card" delay={i * 90}>
              <div className="card-media">
                <Image
                  src={SERVICE_IMAGES[i % SERVICE_IMAGES.length]!}
                  alt=""
                  fill
                  sizes="(max-width: 720px) 100vw, 33vw"
                  aria-hidden="true"
                />
              </div>
              {s.lotLabel && <span className="mono tiny lot">{s.lotLabel}</span>}
              <h3>{s.title}</h3>
              {s.summary && <p>{s.summary}</p>}
              <ul className="ticks">
                {s.bullets.map((p) => (
                  <li key={p}>
                    <Tick />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Methode({
  head,
  steps,
  hideHead,
  locale,
}: {
  head?: Section;
  steps: ProcessStep[];
  hideHead?: boolean;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <section id="methode" className="sec alt">
      <div className="wrap">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? t.sectionsFallback.methode.kicker}
            titre={head?.heading ?? t.sectionsFallback.methode.titre}
          />
        )}
        <ol className="steps">
          {steps.map((e, i) => (
            <Reveal key={e.id} as="li" className="step" delay={i * 80}>
              <span className="step-n mono">{e.number}</span>
              <div>
                <h3>{e.title}</h3>
                {e.description && <p>{e.description}</p>}
                {e.duration && <span className="mono tiny dim">{e.duration}</span>}
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Travaux({
  head,
  projects,
  hideHead,
  locale,
}: {
  head?: Section;
  projects: Project[];
  hideHead?: boolean;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  if (projects.length === 0) return null;
  return (
    <section id="travaux" className="sec">
      <div className="wrap">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? t.sectionsFallback.travaux.kicker}
            titre={head?.heading ?? t.sectionsFallback.travaux.titre}
          />
        )}
        <div className="grid3">
          {projects.map((r, i) => (
            <Reveal key={r.id} as="article" className="case" delay={i * 90}>
              <Link
                href={localizedPath(`/travaux/${r.slug}`, locale)}
                className="stretched-link"
                aria-label={t.services.caseStudyAria(r.title)}
              />
              <div className="case-media">
                <Image
                  src={CASE_IMAGES[i % CASE_IMAGES.length]!}
                  alt=""
                  fill
                  sizes="(max-width: 720px) 100vw, 33vw"
                  aria-hidden="true"
                />
              </div>
              {r.sector && <span className="mono tiny dim">{r.sector}</span>}
              {r.metricValue && (
                <p className="case-num">
                  <CountUp value={r.metricValue} />
                </p>
              )}
              {r.metricLabel && <p className="case-leg">{r.metricLabel}</p>}
              <h3>{r.title}</h3>
              {r.stack.length > 0 && (
                <span className="mono tiny dim">{r.stack.join(" · ")}</span>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Tarifs({
  head,
  plans,
  hideHead,
  locale,
}: {
  head?: Section;
  plans: PricingPlan[];
  hideHead?: boolean;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  return (
    <section id="tarifs" className="sec alt">
      <div className="wrap">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? t.sectionsFallback.tarifs.kicker}
            titre={head?.heading ?? t.sectionsFallback.tarifs.titre}
          />
        )}
        <div className="grid3">
          {plans.map((p, i) => (
            <Reveal
              key={p.id}
              as="article"
              className={"tarif" + (p.isHighlighted ? " vedette" : "")}
              delay={i * 90}
            >
              {p.isHighlighted && (
                <span className="badge mono tiny">{t.pricing.mostRequested}</span>
              )}
              <h3>{p.name}</h3>
              {p.priceNote && <p className="mono tiny dim">{p.priceNote}</p>}
              {p.priceLabel && <p className="prix">{p.priceLabel}</p>}
              <ul className="ticks">
                {p.includes.map((x) => (
                  <li key={x}>
                    <Tick />
                    {x}
                  </li>
                ))}
              </ul>
              <Link
                href={localizedPath("/contact", locale)}
                className={"btn full" + (p.isHighlighted ? "" : " ghost")}
              >
                {t.pricing.requestQuote}
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="note mono tiny">{t.pricing.maintenanceNote}</p>
      </div>
    </section>
  );
}

export function Testimonials({
  head,
  items,
  locale,
}: {
  head?: Section;
  items: Testimonial[];
  locale: Locale;
}) {
  const t = getDictionary(locale);
  if (items.length === 0) return null;
  return (
    <section id="temoignages" className="sec">
      <div className="wrap">
        <SecHead
          kicker={head?.kicker ?? t.sectionsFallback.temoignages.kicker}
          titre={head?.heading ?? t.sectionsFallback.temoignages.titre}
        />
      </div>
      <TestimonialsWall items={items} locale={locale} />
    </section>
  );
}

export function Footer({
  settings,
  locale,
}: {
  settings: SiteSettings | null;
  locale: Locale;
}) {
  const t = getDictionary(locale);
  const brand = settings?.name ?? "SOLIVE";
  const email = settings?.email ?? "bonjour@solive.pro";
  const vat = settings?.vat ?? "BE 0000.000.000";
  const ville = t.common.ville;
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <div className="foot-brand">
          <p className="brand big">
            <span className="mark">
              <Mark size={24} />
            </span>
            <span>{brand.toUpperCase()}</span>
          </p>
          <p className="mono tiny dim">
            {/* settings.baseline has no locale column — only trust it in fr,
                or an admin edit in French would leak onto /en. */}
            {(locale === "fr" ? settings?.baseline : null) ?? t.common.baseline} · {ville}, {t.footer.belgique}
          </p>
          <p className="pourquoi">{t.footer.pourquoi}</p>
        </div>
        <div className="foot-cols mono tiny">
          <div>
            <p className="dim">{t.footer.contact}</p>
            <a href={`mailto:${email}`}>{email}</a>
            <a href="#contact">{t.footer.formulaire}</a>
          </div>
          <div>
            <p className="dim">{t.footer.legal}</p>
            <a href={localizedPath("/mentions-legales", locale)}>{t.footer.mentionsLegales}</a>
            <a href={localizedPath("/confidentialite", locale)}>{t.footer.confidentialite}</a>
            <a href={localizedPath("/cookies", locale)}>{t.footer.cookies}</a>
            <span>{t.footer.tva(vat)}</span>
          </div>
        </div>
        <LangSwitch locale={locale} className="lang-switch footer" />
      </div>
      <div className="wrap">
        <p className="mono tiny dim foot-end">{t.footer.faitA(ville)}</p>
      </div>
    </footer>
  );
}
