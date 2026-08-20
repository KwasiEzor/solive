import Link from "next/link";
import { Reveal } from "./reveal";
import { Tick } from "./icons";

/* ── 1. Différenciateurs : « une IA qui tient debout » ─────────────────── */
const DIFFS: [string, string, string][] = [
  [
    "Souveraineté des données",
    "Envoyées aux serveurs américains, réutilisées pour l’entraînement.",
    "Traitées en Europe, zéro rétention, DPA fourni. Vos données restent les vôtres.",
  ],
  [
    "Zéro lock-in",
    "Enfermé chez un fournisseur, impossible d’en sortir.",
    "Modèles interchangeables, prompts et évals à votre nom, export ouvert.",
  ],
  [
    "Garde-fous & évals",
    "Une démo qui hallucine une fois en production.",
    "Testé, mesuré, borné : garde-fous PII/injection, taux d’erreur chiffré avant la mise en ligne.",
  ],
  [
    "Ancré dans le métier",
    "Un chatbot générique déconnecté de votre activité.",
    "RAG sur vos documents, branché à vos outils (facturation, agenda, CRM).",
  ],
  [
    "Réponses sourcées",
    "Invente une réponse avec aplomb.",
    "Cite ses sources et dit « je ne sais pas » plutôt que d’inventer.",
  ],
  [
    "Prix & résultat",
    "Facturation à l’heure, périmètre flou.",
    "Devis fixe, audit d’abord, résultat mesuré (heures économisées).",
  ],
];

export function IaDifferentiators() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">CE QUI NOUS SÉPARE DU LOT</span>
          <h2>Tout le monde branche un chatbot. Peu livrent une IA qui tient debout.</h2>
        </div>
        <div className="grid2">
          {DIFFS.map(([t, con, pro], i) => (
            <Reveal key={t} as="div" className="diff-item" delay={i * 70}>
              <h3>{t}</h3>
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

/* ── 2. Cas d’usage (Lot 04) ───────────────────────────────────────────── */
const USE_CASES: [string, string][] = [
  [
    "Assistant client (RAG)",
    "Répond à vos clients à partir de vos documents. Support et FAQ 24/7, chaque réponse sourcée.",
  ],
  [
    "Agent de qualification",
    "Qualifie vos leads, répond la nuit, propose un créneau. Vous récupérez des demandes prêtes à traiter.",
  ],
  [
    "Copilote interne",
    "Cherche dans vos documents, résume, rédige des brouillons. Vos équipes gagnent des heures.",
  ],
  [
    "Automatisations métier",
    "Tri d’emails, extraction de PDF et de factures, saisie évitée. L’IA fait la corvée, pas vous.",
  ],
  [
    "Facture électronique 2026",
    "Extraction et contrôle Factur-X / Peppol, prêts pour l’obligation qui arrive en 2026–2027.",
  ],
  [
    "Recherche IA (GEO)",
    "Être trouvé et cité par les moteurs génératifs, pas seulement référencé par Google.",
  ],
];

export function IaUseCases() {
  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">CE QU’ON FABRIQUE</span>
          <h2>Des assistants et des agents ancrés dans votre métier.</h2>
        </div>
        <div className="grid3">
          {USE_CASES.map(([t, d], i) => (
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

/* ── 3. Méthode IA ─────────────────────────────────────────────────────── */
const STEPS: [string, string, string][] = [
  [
    "01",
    "Audit IA",
    "On cartographie ce qui est automatisable, on chiffre le ROI, on écrit une feuille de route. Rien n’est construit à l’aveugle.",
  ],
  [
    "02",
    "Construction",
    "Prix fixe, périmètre écrit. RAG sur vos données, garde-fous, évals. Livré à votre nom.",
  ],
  [
    "03",
    "Care IA",
    "Mensuel : évals continues, mises à jour des modèles, surveillance des coûts de tokens. L’IA ne dérive pas.",
  ],
];

export function IaMethod() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">LA MÉTHODE</span>
          <h2>Audit d’abord. Construction au forfait. Care ensuite.</h2>
        </div>
        <ol className="steps">
          {STEPS.map(([n, t, d], i) => (
            <Reveal key={n} as="li" className="step" delay={i * 80}>
              <span className="step-n mono">{n}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── 4. Tarifs IA (indicatifs) ─────────────────────────────────────────── */
const PLANS: {
  name: string;
  price: string;
  note: string;
  includes: string[];
  featured?: boolean;
}[] = [
  {
    name: "Audit IA",
    price: "à partir de 900 €",
    note: "porte d’entrée",
    includes: [
      "Cartographie des tâches automatisables",
      "ROI chiffré, feuille de route",
      "Déduit du projet si vous continuez",
    ],
  },
  {
    name: "Agent mono-tâche",
    price: "à partir de 2 500 €",
    note: "1 à 2 semaines",
    includes: [
      "Une tâche automatisée de bout en bout",
      "Garde-fous + jeu d’évals",
      "Prix fixe, code livré",
    ],
  },
  {
    name: "Assistant RAG",
    price: "à partir de 6 500 €",
    note: "3 à 6 semaines",
    includes: [
      "Assistant sur vos données, sourcé",
      "Garde-fous, évals, anti-hallucination",
      "Multi-modèle, sans lock-in",
    ],
    featured: true,
  },
  {
    name: "Care IA",
    price: "90 €+/mois",
    note: "sans engagement",
    includes: [
      "Évals continues, mises à jour modèles",
      "Surveillance des coûts de tokens",
      "Garde-fous maintenus",
    ],
  },
];

export function IaPricing() {
  return (
    <section className="sec alt">
      <div className="wrap">
        <div className="sec-head">
          <span className="mono tiny eyebrow">TARIFS IA</span>
          <h2>Un audit d’abord, un forfait ensuite. Jamais à l’heure.</h2>
        </div>
        <div className="grid-ia">
          {PLANS.map((p, i) => (
            <Reveal
              key={p.name}
              as="article"
              className={"tarif" + (p.featured ? " vedette" : "")}
              delay={i * 70}
            >
              {p.featured && <span className="badge mono tiny">Le plus demandé</span>}
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
                href="/contact"
                className={"btn full" + (p.featured ? "" : " ghost")}
              >
                En parler
              </Link>
            </Reveal>
          ))}
        </div>
        <p className="note mono tiny">
          Montants indicatifs, hors TVA. Coûts de tokens au réel ou plafonnés —
          affichés, jamais cachés.
        </p>
      </div>
    </section>
  );
}

/* ── 5. FAQ IA (native <details>, sans JS) ─────────────────────────────── */
const FAQ: [string, string][] = [
  [
    "Mes données servent-elles à entraîner l’IA ?",
    "Non. Traitement en Europe, zéro rétention côté fournisseur, DPA fourni. Vos données restent les vôtres.",
  ],
  [
    "Et si l’IA invente une réponse ?",
    "L’assistant cite ses sources et répond « je ne sais pas » plutôt que d’inventer. On mesure le taux d’erreur avec des évals avant la mise en ligne.",
  ],
  [
    "Suis-je enfermé chez un fournisseur ?",
    "Non. Modèles interchangeables via une passerelle, prompts et évals à votre nom, export ouvert. Vous pouvez partir.",
  ],
  [
    "Combien coûtent les tokens ?",
    "Variable selon l’usage. On les affiche au réel ou on les plafonne — jamais de coût caché.",
  ],
];

export function IaFaq() {
  return (
    <section className="sec">
      <div className="wrap narrow">
        <div className="sec-head">
          <span className="mono tiny eyebrow">QUESTIONS FRÉQUENTES</span>
          <h2>Ce qu’on nous demande sur l’IA.</h2>
        </div>
        <div className="ia-faq">
          {FAQ.map(([q, a]) => (
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

/* ── 6. Teaser assistant (phase 2) ─────────────────────────────────────── */
export function IaAssistantTeaser() {
  return (
    <section className="sec">
      <div className="wrap">
        <div className="ia-live">
          <span className="mono tiny eyebrow">BIENTÔT — EN DIRECT SUR CE SITE</span>
          <h2>L’assistant Solive répondra ici même.</h2>
          <p>
            Un assistant qui répond à partir de ce contenu, cite ses sources,
            dit « je ne sais pas » quand il ne sait pas, et vous met en relation.
            La démo, c’est le produit.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Teaser accueil ────────────────────────────────────────────────────── */
export function IaHomeTeaser() {
  return (
    <section className="sec">
      <div className="wrap">
        <Reveal as="div" className="ia-teaser">
          <div>
            <span className="mono tiny eyebrow">NOUVEAU — IA & AGENTS</span>
            <h2>Une IA que vous possédez, hébergée en Europe, qui ne raconte pas n’importe quoi.</h2>
            <p>
              Assistants clients, agents de qualification, automatisations métier.
              Sourcé, sans lock-in, mesuré. Pas un wrapper ChatGPT de plus.
            </p>
          </div>
          <Link href="/ia" className="btn">
            Découvrir l’offre IA
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
