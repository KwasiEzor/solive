import Image from "next/image";
import Link from "next/link";
import type {
  PricingPlan,
  ProcessStep,
  Project,
  Section,
  Service,
  SiteSettings,
} from "@/server/db/types";
import { CountUp } from "./count-up";
import { PlanCycle } from "./plan-cycle";
import { Reveal } from "./reveal";
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

const BASELINE = "studio de développement";
const VILLE = "Bruxelles";
const HL = "qui tiennent debout";

export function SecHead({ kicker, titre }: { kicker: string; titre: string }) {
  return (
    <div className="sec-head">
      {kicker && <span className="mono tiny eyebrow">{kicker.toUpperCase()}</span>}
      <h2>{titre}</h2>
    </div>
  );
}

export function Hero({ section }: { section?: Section }) {
  const heading =
    section?.heading ??
    "On construit des sites et des applications qui tiennent debout.";
  const kicker = section?.kicker ?? `${BASELINE} — ${VILLE}`;
  const idx = heading.indexOf(HL);
  const before = idx >= 0 ? heading.slice(0, idx) : heading;
  const after = idx >= 0 ? heading.slice(idx + HL.length) : "";

  return (
    <section id="top" className="hero">
      <div className="hero-media">
        <Image
          src="/images/code-macro.jpg"
          alt=""
          fill
          sizes="100vw"
          priority
          aria-hidden="true"
        />
      </div>
      <div className="wrap hero-in">
        <div className="hero-copy">
          <p className="mono tiny eyebrow">{kicker.toUpperCase()}</p>
          <h1>
            {before}
            {idx >= 0 && (
              <span className="hl">
                {HL}
                <svg
                  className="hl-line"
                  viewBox="0 0 300 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8 C 70 2, 150 11, 298 4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            )}
            {after}
          </h1>
          <p className="lede">
            Vitrines, outils métier, apps mobiles. Pour les artisans, les PME et
            les startups en Belgique, en France et au Luxembourg. Devis fixe,
            calendrier daté, code livré à votre nom.
          </p>
          <div className="hero-cta">
            <Link href="/contact" className="btn">
              Prendre 20 minutes
            </Link>
            <Link href="/services" className="btn ghost">
              Voir comment on travaille
            </Link>
          </div>
          <ul className="hero-facts mono tiny">
            <li>4 à 6 semaines pour un site</li>
            <li>Prix fixe, pas de rallonge</li>
            <li>Vous gardez le code</li>
          </ul>
        </div>
        <div className="hero-plan">
          <PlanCycle />
        </div>
      </div>
    </section>
  );
}

export function Ticker() {
  const items = [
    "Next.js",
    "TypeScript",
    "React Native",
    "Supabase",
    "Stripe",
    "Tailwind",
    "Vercel",
    "SEO technique",
    "Facture électronique 2026",
    "RGPD",
  ];
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
}: {
  head?: Section;
  items: Service[];
  hideHead?: boolean;
}) {
  return (
    <section id="services" className="sec">
      <div className="wrap">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? "Ce qu'on fabrique"}
            titre={head?.heading ?? "Trois lots, un seul interlocuteur."}
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
}: {
  head?: Section;
  steps: ProcessStep[];
  hideHead?: boolean;
}) {
  return (
    <section id="methode" className="sec alt">
      <div className="wrap">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? "La méthode"}
            titre={head?.heading ?? "Quatre étapes. Vous savez toujours où on en est."}
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
}: {
  head?: Section;
  projects: Project[];
  hideHead?: boolean;
}) {
  if (projects.length === 0) return null;
  return (
    <section id="travaux" className="sec">
      <div className="wrap">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? "Travaux"}
            titre={head?.heading ?? "Ce que ça donne une fois livré."}
          />
        )}
        <div className="grid3">
          {projects.map((r, i) => (
            <Reveal key={r.id} as="article" className="case" delay={i * 90}>
              <Link
                href={`/travaux/${r.slug}`}
                className="stretched-link"
                aria-label={`Voir l’étude de cas : ${r.title}`}
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
}: {
  head?: Section;
  plans: PricingPlan[];
  hideHead?: boolean;
}) {
  return (
    <section id="tarifs" className="sec alt">
      <div className="wrap">
        {!hideHead && (
          <SecHead
            kicker={head?.kicker ?? "Tarifs"}
            titre={head?.heading ?? "Les ordres de grandeur, avant même de s'appeler."}
          />
        )}
        <div className="grid3">
          {plans.map((t, i) => (
            <Reveal
              key={t.id}
              as="article"
              className={"tarif" + (t.isHighlighted ? " vedette" : "")}
              delay={i * 90}
            >
              {t.isHighlighted && (
                <span className="badge mono tiny">Le plus demandé</span>
              )}
              <h3>{t.name}</h3>
              {t.priceNote && <p className="mono tiny dim">{t.priceNote}</p>}
              {t.priceLabel && <p className="prix">{t.priceLabel}</p>}
              <ul className="ticks">
                {t.includes.map((x) => (
                  <li key={x}>
                    <Tick />
                    {x}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact"
                className={"btn full" + (t.isHighlighted ? "" : " ghost")}
              >
                Demander un devis
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="note mono tiny">
          Entretien, hébergement et petites évolutions : 90 € / mois, sans
          engagement. Prix hors TVA.
        </p>
      </div>
    </section>
  );
}

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const brand = settings?.name ?? "SOLIVE";
  const email = settings?.email ?? "bonjour@solive.pro";
  const vat = settings?.vat ?? "BE 0000.000.000";
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
            {(settings?.baseline ?? BASELINE)} · {VILLE}, Belgique
          </p>
          <p className="pourquoi">
            Une solive, c&apos;est la poutre qu&apos;on ne voit jamais et sur
            laquelle repose tout le plancher.
          </p>
        </div>
        <div className="foot-cols mono tiny">
          <div>
            <p className="dim">Contact</p>
            <a href={`mailto:${email}`}>{email}</a>
            <a href="#contact">Formulaire</a>
          </div>
          <div>
            <p className="dim">Légal</p>
            <a href="/mentions-legales">Mentions légales</a>
            <a href="/confidentialite">Confidentialité</a>
            <span>TVA {vat}</span>
          </div>
        </div>
      </div>
      <div className="wrap">
        <p className="mono tiny dim foot-end">
          Fait à {VILLE}. Hébergé en Europe.
        </p>
      </div>
    </footer>
  );
}
