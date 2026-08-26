import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/urls";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";
import { Reveal } from "./reveal";
import { Tick } from "./icons";

export function IaDifferentiators({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).ia;
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.diffsHead.eyebrow}</span>
          <h2>{t.diffsHead.h2}</h2>
        </div>
        <div className="grid2">
          {t.diffs.map(([h, con, pro], i) => (
            <Reveal key={h} as="div" className="diff-item" delay={i * 70}>
              <h3>{h}</h3>
              <p className="diff-con">{con}</p>
              <p className="diff-pro">
                <Tick />
                {pro}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IaUseCases({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).ia;
  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.useCasesHead.eyebrow}</span>
          <h2>{t.useCasesHead.h2}</h2>
        </div>
        <div className="grid3">
          {t.useCases.map(([h, d, img], i) => (
            <Reveal key={h} as="article" className="card" delay={i * 70}>
              <div className="card-media">
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="(max-width: 720px) 100vw, 33vw"
                  aria-hidden="true"
                />
              </div>
              <h3>{h}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IaMethod({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).ia;
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.methodHead.eyebrow}</span>
          <h2>{t.methodHead.h2}</h2>
        </div>
        <ol className="steps">
          {t.steps.map(([n, h, d], i) => (
            <Reveal key={n} as="li" className="step" delay={i * 80}>
              <span className="step-n mono">{n}</span>
              <div>
                <h3>{h}</h3>
                <p>{d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function IaPricing({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).ia;
  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.pricingHead.eyebrow}</span>
          <h2>{t.pricingHead.h2}</h2>
        </div>
        <div className="grid-ia">
          {t.plans.map((p, i) => (
            <Reveal
              key={p.name}
              as="article"
              className={"tarif" + (p.featured ? " vedette" : "")}
              delay={i * 70}
            >
              {p.featured && <span className="badge mono tiny">{getDictionary(locale).pricing.mostRequested}</span>}
              <h3>{p.name}</h3>
              <p className="mono tiny dim">{p.note}</p>
              <p className="prix">{p.price}</p>
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
                className={"btn full" + (p.featured ? "" : " ghost")}
              >
                {t.pricingCta}
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="note mono tiny">{t.pricingNote}</p>
      </div>
    </section>
  );
}

export function IaFaq({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).ia;
  return (
    <section className="sec">
      <div className="wrap narrow">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.faqHead.eyebrow}</span>
          <h2>{t.faqHead.h2}</h2>
        </div>
        <div className="ia-faq">
          {t.faq.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export function IaAssistantTeaser({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).ia.assistantTeaser;
  return (
    <section className="sec">
      <div className="wrap">
        <div className="ia-live">
          <span className="mono tiny eyebrow">{t.eyebrow}</span>
          <h2>{t.h2}</h2>
          <p>{t.p}</p>
        </div>
      </div>
    </section>
  );
}

export function IaHomeTeaser({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).ia.homeTeaser;
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal as="div" className="ia-teaser">
          <div>
            <span className="mono tiny eyebrow">{t.eyebrow}</span>
            <h2>{t.h2}</h2>
            <p>{t.p}</p>
          </div>
          <Link href={localizedPath("/ia", locale)} className="btn">
            {t.cta}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
