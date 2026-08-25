import Link from "next/link";
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

const VALUES: [string, string][] = [
  [
    "Prix fixe, dit une fois",
    "Le devis couvre le périmètre écrit. Pas de ligne surprise à la fin, pas de « ça dépend » à chaque question.",
  ],
  [
    "Le code vous appartient",
    "Livré à votre nom, sur vos comptes. Vous pouvez partir avec — et le fait de pouvoir partir, c’est ce qui garde la relation honnête.",
  ],
  [
    "Hébergé en Europe",
    "Vos données et celles de vos clients restent sous droit européen. Pas un détail : un choix.",
  ],
  [
    "On mesure, on ne promet pas",
    "Un temps de chargement, un taux d’erreur d’un assistant IA, un délai de livraison : des chiffres vérifiables, pas des éléments de langage.",
  ],
  [
    "Direct, sans commercial",
    "La personne qui répond à l’appel de cadrage est celle qui écrit le code. Rien ne se perd dans la traduction.",
  ],
  [
    "Le périmètre avant le clavier",
    "Cadrage écrit, maquettes validées, puis développement. Vous savez ce que vous obtenez avant qu’une ligne de code soit écrite.",
  ],
];

export function WhyValues() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">CE QU’ON DÉFEND</span>
          <h2>Des principes, pas des éléments de langage.</h2>
        </div>
        <div className="grid3">
          {VALUES.map(([t, d], i) => (
            <Reveal key={t} as="article" className="card" delay={i * 70}>
              <h3>{t}</h3>
              <p>{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

const SKILLS: [string, string[]][] = [
  ["Web & mobile", ["Next.js", "TypeScript", "React Native", "Tailwind"]],
  ["Données & infra", ["Supabase", "PostgreSQL", "Vercel", "Stripe"]],
  ["IA & agents", ["RAG", "Mistral / Llama", "Évals & garde-fous", "AI Gateway"]],
];

export function WhySkills() {
  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">CE QU’ON SAIT FAIRE</span>
          <h2>Un stack resserré, tenu à jour — pas cent technologies à moitié maîtrisées.</h2>
        </div>
        <div className="grid3">
          {SKILLS.map(([cat, items]) => (
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

export function WhyFounder() {
  return (
    <section className="sec">
      <div className="wrap narrow">
        <div className="founder-card">
          <FounderAvatar />
          <div>
            <p className="mono tiny eyebrow">LA PERSONNE DERRIÈRE SOLIVE</p>
            <p className="founder-text">
              Solive est un atelier d’une seule personne, par choix. Pas de
              chef de projet entre vous et le code, pas de commercial qui
              chiffre ce qu’il ne construira pas. Le cadrage, le
              développement, la mise en ligne et le café du matin : la même
              personne, du premier appel à la livraison.
            </p>
            <p className="founder-text">
              C’est un choix de taille, pas un manque de moyens : rester
              petit pour rester direct, mesurer ce qu’on livre plutôt que de
              le survendre, et ne prendre que les projets qu’on peut
              honorer avec un devis fixe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function WhyVision() {
  return (
    <section className="sec alt">
      <div className="wrap narrow">
        <div className="sec-head">
          <span className="mono tiny eyebrow">LA VISION</span>
          <h2>Rester un atelier, même en grandissant.</h2>
        </div>
        <p className="vision-text">
          Le marché du développement se remplit de promesses génériques —
          « on fait de l’IA », « on livre vite », « on est experts ». Solive
          part du principe inverse : dire moins, mais le tenir. Un devis
          fixe qui ne bouge pas. Un calendrier daté qui se respecte. Une IA
          qui cite ses sources au lieu d’inventer. Du code que vous
          possédez réellement, pas que vous louez.
        </p>
        <p className="vision-text">
          À mesure que Solive grandit, l’objectif n’est pas de devenir une
          agence de plus, mais de rester l’atelier où l’on peut encore
          appeler directement la personne qui a écrit votre code — et
          d’étendre ce qu’on sait faire (notamment sur l’IA appliquée aux
          métiers) sans jamais perdre cette proximité.
        </p>
        <Link href="/contact" className="btn">
          En discuter directement
        </Link>
      </div>
    </section>
  );
}
