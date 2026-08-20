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
          <h2>Pas de traceur, pas de profilage</h2>
          <p>
            La vitrine ne charge aucun outil d’analyse d’audience ni aucun script
            publicitaire. Aucune donnée n’est partagée avec des régies. Le
            bandeau de consentement est préventif : le jour où une mesure
            d’audience anonyme ou l’assistant IA seront proposés, ils ne se
            chargeront <strong>qu’avec votre accord explicite</strong>, et vous
            pourrez revenir sur ce choix à tout moment.
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
