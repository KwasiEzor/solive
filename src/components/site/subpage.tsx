import Link from "next/link";

/** Compact hero for dedicated pages. */
export function PageHeader({
  kicker,
  title,
  lede,
}: {
  kicker: string;
  title: string;
  lede?: string;
}) {
  return (
    <section className="page-head">
      <div className="wrap">
        <p className="mono tiny eyebrow">{kicker.toUpperCase()}</p>
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
      </div>
    </section>
  );
}

/** Accent call-to-action band, closing dedicated pages and the home. */
export function ContactCta({
  title = "Un projet en tête ?",
  text = "Un appel de 20 minutes, un devis fixe et un calendrier daté. Sans engagement.",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="cta-band">
          <div>
            <h2>{title}</h2>
            <p>{text}</p>
          </div>
          <Link href="/contact" className="btn">
            Parler du projet
          </Link>
        </div>
      </div>
    </section>
  );
}
