import Image from "next/image";
import Link from "next/link";

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
