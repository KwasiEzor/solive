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

/** What "prix fixe" actually guarantees — reassurance around the pricing. */
export function PricingReassurance() {
  const points: [string, string][] = [
    ["Périmètre écrit", "Ce qui est inclus est noté noir sur blanc avant de commencer. On sait tous les deux où on va."],
    ["Pas de rallonge surprise", "Le prix ne bouge pas pour le périmètre convenu. Tout ajout est chiffré à part, et c’est vous qui décidez."],
    ["Calendrier daté", "Une date de livraison, des jalons visibles. Vous savez toujours où on en est."],
    ["Le code est à vous", "Livré à votre nom, hébergé en Europe. Pas de dépendance, pas de rançon technique."],
  ];
  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">CE QUE « PRIX FIXE » VEUT DIRE</span>
          <h2>Un forfait, sans mauvaise surprise.</h2>
        </div>
        <div className="grid2 reassure">
          {points.map(([t, d]) => (
            <div key={t} className="reassure-item">
              <h3>{t}</h3>
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
