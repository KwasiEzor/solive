import Image from "next/image";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n/dictionary";
import { localizedPath } from "@/lib/i18n/urls";
import type { SiteLocale as Locale } from "@/lib/i18n/locale";

/** Compact hero for dedicated pages, with optional scrimmed backdrop. */
export function PageHeader({
  kicker,
  title,
  lede,
  image,
}: {
  kicker: string;
  title: string;
  lede?: string;
  image?: string;
}) {
  return (
    <section className={"page-head" + (image ? " has-media" : "")}>
      {image && (
        <div className="hero-media">
          <Image
            src={image}
            alt=""
            fill
            sizes="100vw"
            priority
            aria-hidden="true"
          />
        </div>
      )}
      <div className="wrap">
        <p className="mono tiny eyebrow">{kicker.toUpperCase()}</p>
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
    </section>
  );
}

/** What "prix fixe" actually guarantees — reassurance around the pricing. */
export function PricingReassurance({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).pricingReassurance;
  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">{t.eyebrow}</span>
          <h2>{t.h2}</h2>
        </div>
        <div className="grid2 reassure">
          {t.points.map(([h, d]) => (
            <div key={h} className="reassure-item">
              <h3>{h}</h3>
              <p>{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Accent call-to-action band, closing dedicated pages and the home. */
export function ContactCta({
  locale,
  title,
  text,
}: {
  locale: Locale;
  title?: string;
  text?: string;
}) {
  const t = getDictionary(locale).contactCta;
  return (
    <section className="sec">
      <div className="wrap">
        <div className="cta-band">
          <div>
            <h2>{title ?? t.defaultTitle}</h2>
            <p>{text ?? t.defaultText}</p>
          </div>
          <Link href={localizedPath("/contact", locale)} className="btn">
            {t.button}
          </Link>
        </div>
      </div>
    </section>
  );
}
