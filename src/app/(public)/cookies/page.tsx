import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";

export const metadata: Metadata = {
  title: "Cookies & traceurs",
  description:
    "Ce que Solive stocke sur votre appareil : uniquement l’essentiel, aucun traceur publicitaire. Détail des finalités et durées.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/cookies` },
};

const ROWS: [string, string, string, string][] = [
  [
    "solive-consent",
    "localStorage",
    "Mémoriser votre choix de consentement",
    "Jusqu’à effacement",
  ],
  [
    "Session admin (Supabase)",
    "Cookie strictement nécessaire",
    "Garder l’administrateur connecté (espace /admin uniquement)",
    "Durée de session",
  ],
  [
    "Turnstile (Cloudflare)",
    "Cookie strictement nécessaire",
    "Anti-spam du formulaire de contact, au moment de l’envoi",
    "Le temps de la vérification",
  ],
  [
    "Cache hors-ligne (PWA)",
    "Service worker / Cache API",
    "Consultation hors-ligne du site public",
    "Jusqu’à mise à jour ou effacement",
  ],
];

export default function CookiesPage() {
  return (
    <>
      <PageHeader
        kicker="Cookies & traceurs"
        title="Le strict nécessaire, rien de plus."
        lede="Solive ne dépose aucun cookie publicitaire ni de suivi tiers. Voici précisément ce qui est stocké sur votre appareil, et pourquoi."
      />
      <section className="sec">
        <div className="wrap narrow legal">
          <h2>Une mesure d’audience anonyme, sans cookie</h2>
          <p>
            On mesure l’audience du site pour l’améliorer et évaluer nos
            campagnes, mais <strong>sans cookie et sans donnée personnelle</strong>.
            Concrètement : la page vue, le pays (à la maille du pays),
            l’appareil (mobile/ordinateur), le site référent et les paramètres
            de campagne (<code>utm_*</code>) sont enregistrés de façon agrégée.
            Aucune adresse IP n’est conservée — elle sert uniquement à calculer
            une empreinte <em>à sens unique qui change chaque jour</em>, ce qui
            permet de compter les visiteurs sans jamais les identifier ni les
            suivre d’un jour à l’autre.
          </p>
          <p>
            Ces données restent <strong>chez nous, hébergées en Europe</strong>,
            et ne sont partagées avec aucune régie publicitaire. Vous n’en voulez
            pas ? Cliquez <em>« Refuser le non-essentiel »</em> dans le bandeau —
            la mesure est alors désactivée pour vous. Les signaux navigateur
            « Do Not Track » et « Global Privacy Control » sont également
            respectés.
          </p>

          <h2>Ce qui est réellement utilisé</h2>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Finalité</th>
                  <th>Durée</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Revenir sur votre choix</h2>
          <p>
            Votre décision est conservée localement (clé{" "}
            <code>solive-consent</code>). Pour la réinitialiser, effacez les
            données du site dans votre navigateur : le bandeau réapparaîtra au
            prochain chargement.
          </p>

          <p className="legal-more">
            Voir aussi la{" "}
            <a href="/confidentialite">politique de confidentialité</a> et les{" "}
            <a href="/mentions-legales">mentions légales</a>.
          </p>
        </div>
      </section>
    </>
  );
}
