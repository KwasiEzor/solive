import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/urls";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";
import { Mark, Tick } from "./icons";
import { Reveal } from "./reveal";

/** Avatar slot: the S-mark on a gradient field until a real photo is supplied
 * — designed to look intentional either way, trivial to swap for an <Image>. */
export function FounderAvatar() {
  return (
    <div className="founder-avatar" aria-hidden="true">
      <Mark size={40} />
    </div>
  );
}

export function WhyValues({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).whySolive;
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.valuesHead.eyebrow}</span>
          <h2>{t.valuesHead.h2}</h2>
        </div>
        <div className="grid3">
          {t.values.map(([h, d], i) => (
            <Reveal key={h} as="article" className="card" delay={i * 70}>
              <h3>{h}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhySkills({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).whySolive;
  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.skillsHead.eyebrow}</span>
          <h2>{t.skillsHead.h2}</h2>
        </div>
        <div className="grid3">
          {t.skills.map(([cat, items]) => (
            <div key={cat} className="card">
              <h3>{cat}</h3>
              <ul className="ticks">
                {items.map((s) => (
                  <li key={s}>
                    <Tick />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WhyFounder({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).whySolive.founder;
  return (
    <section className="sec">
      <div className="wrap narrow">
        <div className="founder-card">
          <FounderAvatar />
          <div>
            <p className="mono tiny eyebrow">{t.eyebrow}</p>
            <p className="founder-text">{t.p1}</p>
            <p className="founder-text">{t.p2}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyVision({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).whySolive.vision;
  return (
    <section className="sec alt">
      <div className="wrap narrow">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.eyebrow}</span>
          <h2>{t.h2}</h2>
        </div>
        <p className="vision-text">{t.p1}</p>
        <p className="vision-text">{t.p2}</p>
        <Link href={localizedPath("/contact", locale)} className="btn">
          {t.cta}
        </Link>
      </div>
    </section>
  );
}
