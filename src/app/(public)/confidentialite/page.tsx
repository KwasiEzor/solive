import type { Metadata } from "next";
import { PageHeader } from "@/components/site/subpage";
import { env } from "@/lib/env";
import { getSiteSettings } from "@/server/queries/content";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment Solive traite vos données personnelles : finalités, bases légales, sous-traitants européens, durées de conservation et vos droits RGPD.",
  alternates: { canonical: `${env.NEXT_PUBLIC_SITE_URL}/confidentialite` },
};

const SUBPROCESSORS: [string, string, string][] = [
  ["Supabase (base de données, authentification)", "Union européenne", "Hébergement du contenu et des demandes"],
  ["Vercel (hébergement applicatif)", "Union européenne", "Diffusion du site"],
  ["Brevo (envoi d’e-mails)", "Union européenne", "Notification et accusé de réception des demandes"],
  ["Cloudflare Turnstile (anti-spam)", "UE / traitement sans cookie tiers", "Protection du formulaire de contact"],
  ["Upstash (limitation de débit)", "Union européenne", "Prévention des abus du formulaire"],
];

export default async function ConfidentialitePage() {
  const s = await getSiteSettings();
  const email = s?.email ?? "bonjour@solive.pro";
  const name = s?.name ?? "Solive";

  return (
    <>
      <PageHeader
        kicker="Confidentialité"
        title="Vos données, traitées avec sobriété."
        lede="On ne collecte que ce qui est nécessaire pour répondre à votre demande, on l’héberge en Europe, et vous gardez la main dessus."
      />
      <section className="sec">
        <div className="wrap narrow legal">
          <p className="legal-updated mono tiny dim">
            Dernière mise à jour : 20 août 2026.
          </p>

          <h2>1. Responsable du traitement</h2>
          <p>
            {name}, studio de développement établi à Bruxelles (Belgique).
            Contact : <a href={`mailto:${email}`}>{email}</a>.<br />
            <em>
              Dénomination légale, numéro BCE et siège social : [À COMPLÉTER].
            </em>
          </p>

          <h2>2. Données que nous traitons</h2>
          <ul>
            <li>
              <strong>Formulaire de contact :</strong> nom, adresse e-mail,
              société (facultatif), type de projet et message.
            </li>
            <li>
              <strong>Données techniques anti-abus :</strong> une empreinte
              <em> hachée</em> de votre adresse IP et l’agent utilisateur, pour
              limiter le spam. L’IP en clair n’est pas conservée.
            </li>
            <li>
              <strong>Mesure d’audience anonyme :</strong> page vue, pays,
              appareil, référent et paramètres de campagne, de façon agrégée et
              sans cookie. Aucune IP conservée (empreinte à sens unique changée
              chaque jour). Pas de profilage, pas de suivi publicitaire.
            </li>
          </ul>

          <h2>3. Finalités et bases légales</h2>
          <ul>
            <li>
              Répondre à votre demande et établir un devis —{" "}
              <em>mesures précontractuelles</em> (art. 6.1.b RGPD).
            </li>
            <li>
              Protéger le formulaire contre les abus —{" "}
              <em>intérêt légitime</em> (art. 6.1.f).
            </li>
            <li>
              Mesure d’audience anonyme (sans donnée personnelle) —{" "}
              <em>intérêt légitime</em> (art. 6.1.f), avec opposition possible à
              tout moment via le bandeau ou les signaux « Do Not Track ».
            </li>
            <li>
              Assistant IA, le cas échéant — <em>consentement</em> (art. 6.1.a),
              révocable à tout moment.
            </li>
          </ul>

          <h2>4. Sous-traitants</h2>
          <p>
            Vos données sont traitées par des prestataires établis dans l’Union
            européenne, liés par un accord de traitement (DPA) :
          </p>
          <div className="legal-table-wrap">
            <table className="legal-table">
              <thead>
                <tr>
                  <th>Prestataire</th>
                  <th>Localisation</th>
                  <th>Rôle</th>
                </tr>
              </thead>
              <tbody>
                {SUBPROCESSORS.map((r) => (
                  <tr key={r[0]}>
                    <td>{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>5. Durées de conservation</h2>
          <ul>
            <li>
              Demandes de contact : jusqu’à 36 mois après le dernier échange,
              puis anonymisées ou supprimées.
            </li>
            <li>Journaux techniques anti-abus : 90 jours au maximum.</li>
            <li>Journal d’audit de l’administration : conservé pour la sécurité.</li>
          </ul>

          <h2>6. Vos droits</h2>
          <p>
            Vous disposez des droits d’accès, de rectification, d’effacement, de
            limitation, d’opposition et de portabilité. Écrivez-nous à{" "}
            <a href={`mailto:${email}`}>{email}</a> ; nous répondons sous 30
            jours. Vous pouvez aussi introduire une réclamation auprès de
            l’Autorité de protection des données (APD, Belgique) —{" "}
            <a href="https://www.autoriteprotectiondonnees.be" rel="noopener noreferrer" target="_blank">
              autoriteprotectiondonnees.be
            </a>
            .
          </p>

          <h2>7. Transferts hors UE</h2>
          <p>
            Aucun transfert de vos données personnelles en dehors de l’Union
            européenne n’est effectué dans le cadre du fonctionnement du site.
          </p>

          <h2>8. Sécurité</h2>
          <p>
            Chiffrement en transit, cloisonnement par politiques d’accès au
            niveau de la base (RLS), authentification renforcée (MFA) et journal
            d’audit côté administration.
          </p>

          <p className="legal-more">
            Voir aussi la <a href="/cookies">politique cookies</a> et les{" "}
            <a href="/mentions-legales">mentions légales</a>.
          </p>
        </div>
      </section>
    </>
  );
}
