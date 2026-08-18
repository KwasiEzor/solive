# PROMPT — Solive : site vitrine + admin CMS, en web app hors-ligne

> **Comment utiliser ce document.** C'est le brief complet à donner à Claude Code. Colle-le dans `docs/BRIEF.md` à la racine du projet, puis démarre par `/implement SLV-001`. Chaque exigence porte un identifiant `SLV-XXX` traçable dans les commits, les tests et les PR. L'agent ne passe à la phase suivante que quand **tous** les critères d'acceptation de la phase courante passent en CI.
>
> **Règle d'or pour l'agent :** aucune exigence n'est implémentée sans test écrit d'abord (RED → GREEN → REFACTOR). Si une exigence est ambiguë, l'agent s'arrête et pose la question — il n'invente pas de périmètre.

---

## 0. Contexte produit

**Solive** est un studio de développement basé à Bruxelles. Il vend trois choses : sites vitrines et refontes, applications web métier sur mesure, applications mobiles. Ses clients sont des artisans, des PME et des startups en Belgique, en France et au Luxembourg.

Le site a **deux publics et deux surfaces** :

| Surface | Public | Objectif unique |
|---|---|---|
| **Vitrine** (`/`) | Prospects, dont beaucoup sur mobile, parfois en zone de mauvaise couverture | Générer une demande de devis qualifiée |
| **Admin** (`/admin`) | Le propriétaire du studio, seul, éventuellement un collaborateur | Modifier tout le contenu public sans toucher au code, et traiter les demandes entrantes |

La vitrine existe déjà en maquette React monofichier (`solive-site.jsx`). Elle sert de **référence visuelle et de source de contenu**, pas de base de code : elle est à découper proprement.

**Contrainte métier structurante :** le site doit rester consultable et le formulaire de contact utilisable **sans connexion**. Un artisan qui consulte le site depuis un chantier en sous-sol doit pouvoir envoyer sa demande ; elle partira quand le réseau revient.

---

## 1. Stack imposée

Ne pas substituer ces choix sans validation explicite.

| Couche | Choix | Raison |
|---|---|---|
| Framework | **Next.js 15**, App Router, React Server Components, TypeScript `strict` | RSC pour un premier rendu quasi statique |
| Style | **Tailwind CSS** + variables CSS pour les palettes, **shadcn/ui** côté admin uniquement | La vitrine reste sur mesure, l'admin peut être générique |
| Base de données | **Supabase Postgres** | RLS native |
| ORM & migrations | **Drizzle ORM** + `drizzle-kit` | Migrations versionnées dans le repo |
| Auth | **Supabase Auth** + MFA TOTP | Invitation uniquement, pas d'inscription publique |
| Médias | **Cloudinary** (upload signé côté serveur) | Transformations et AVIF/WebP automatiques |
| Emails | **Resend** + **react-email** | Templates testables |
| Service worker | **Serwist** (`@serwist/next`) | Successeur maintenu de `next-pwa` |
| Anti-spam | **Cloudflare Turnstile** | Pas de cookie tiers, contrairement à reCAPTCHA |
| Rate limiting | **Upstash Redis** + `@upstash/ratelimit` | Edge-compatible |
| Éditeur riche | **Tiptap**, stockage JSON, rendu serveur | Pas de HTML brut en base |
| i18n | **next-intl** — FR par défaut, NL et EN | Bruxelles est bilingue, c'est un avantage commercial |
| Observabilité | **Sentry** (erreurs) + **Vercel Analytics** (Web Vitals) | |
| Tests | **Vitest** + **MSW** (unitaire/intégration), **Playwright** (e2e), **axe-core** (a11y) | |
| Hébergement | **Vercel**, région `fra1` | Données en Europe |

---

## 2. Contraintes non négociables

- **SLV-001** — Aucune inscription publique. La création de compte admin se fait exclusivement par invitation depuis un compte existant, ou par un script d'amorçage exécuté une seule fois (`pnpm seed:owner`).
- **SLV-002** — Toute table contenant des données non publiques a le RLS **activé** et des policies explicites. Une table sans policy est un bug bloquant, pas un oubli.
- **SLV-003** — La clé `service_role` de Supabase n'apparaît jamais dans un bundle client. Vérifié par un test qui grep le build.
- **SLV-004** — Toute entrée utilisateur est validée par un schéma **Zod** partagé entre client et serveur. Le serveur ne fait jamais confiance à une validation client.
- **SLV-005** — Aucun cookie non essentiel n'est posé avant consentement explicite.
- **SLV-006** — TDD strict. Un commit qui ajoute du comportement sans test associé est refusé en CI.
- **SLV-007** — Couverture de test ≥ 80 % en lignes et branches sur `src/lib`, `src/server` et `src/app/api`.
- **SLV-008** — Accessibilité **WCAG 2.2 niveau AA** sur les deux surfaces. Zéro violation `axe-core` de sévérité serious ou critical.

---

## 3. Arborescence cible

```
solive/
├── docs/
│   ├── BRIEF.md                 ← ce document
│   ├── ADR/                     ← décisions d'architecture, une par fichier
│   └── RUNBOOK.md               ← procédures : restauration, rotation de secrets
├── drizzle/
│   ├── schema.ts
│   ├── relations.ts
│   └── migrations/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                 ← vitrine
│   │   │   ├── travaux/[slug]/page.tsx  ← étude de cas
│   │   │   ├── mentions-legales/page.tsx
│   │   │   ├── confidentialite/page.tsx
│   │   │   └── hors-ligne/page.tsx      ← fallback service worker
│   │   ├── (admin)/admin/
│   │   │   ├── layout.tsx               ← garde d'auth
│   │   │   ├── page.tsx                 ← tableau de bord
│   │   │   ├── contenu/[section]/page.tsx
│   │   │   ├── travaux/page.tsx
│   │   │   ├── medias/page.tsx
│   │   │   ├── demandes/page.tsx
│   │   │   ├── parametres/page.tsx
│   │   │   └── journal/page.tsx          ← audit log
│   │   ├── connexion/page.tsx
│   │   ├── api/
│   │   │   ├── contact/route.ts
│   │   │   ├── revalidate/route.ts
│   │   │   └── health/route.ts
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── manifest.ts
│   │   └── opengraph-image.tsx
│   ├── components/
│   │   ├── site/                ← Hero, PlanCycle, Services, Tarifs, Faq…
│   │   ├── admin/
│   │   └── ui/                  ← shadcn
│   ├── server/
│   │   ├── actions/             ← Server Actions, une par domaine
│   │   ├── queries/             ← lectures cachées avec tags
│   │   ├── auth/
│   │   └── services/            ← resend, cloudinary, turnstile
│   ├── lib/
│   │   ├── schemas/             ← Zod
│   │   ├── result.ts            ← Result<T,E>
│   │   └── offline/             ← file d'attente IndexedDB
│   ├── messages/                ← fr.json, nl.json, en.json
│   ├── styles/tokens.css        ← les 3 palettes
│   ├── middleware.ts
│   └── sw.ts                    ← service worker Serwist
├── tests/
│   ├── unit/  ├── integration/  ├── e2e/  └── fixtures/
└── .github/workflows/ci.yml
```

---

## 4. Modèle de données

Écrire le schéma Drizzle complet avant toute UI. Conventions : `snake_case` en base, `camelCase` en TypeScript, `uuid` v7 en clés primaires, `created_at`/`updated_at` partout, suppression logique (`deleted_at`) sur les tables de contenu.

### 4.1 Authentification et rôles

- **SLV-010** `admin_users` — miroir applicatif de `auth.users` : `id` (FK vers `auth.users`), `email`, `full_name`, `role` (`owner` | `editor`), `mfa_enrolled_at`, `last_seen_at`, `disabled_at`.
- **SLV-011** `invitations` — `email`, `role`, `token_hash` (jamais le token en clair), `expires_at` (72 h), `accepted_at`, `invited_by`.
- **SLV-012** `audit_log` — `actor_id`, `action` (enum), `entity_type`, `entity_id`, `diff` (JSONB avant/après), `ip_hash`, `user_agent`, `created_at`. **Insertion seule** : ni UPDATE ni DELETE autorisés, même pour `owner`.
- **SLV-013** `login_attempts` — `email_hash`, `ip_hash`, `succeeded`, `created_at`. Purge automatique à 30 jours.

### 4.2 Contenu

Le contenu est éditable **section par section**, pas comme une page monolithique. Chaque enregistrement porte un statut de publication.

- **SLV-020** `site_settings` (singleton) — nom, baseline, email, téléphone, adresse, TVA, réseaux sociaux, palette active (`chaux` | `ardoise` | `cobalt`), langues activées.
- **SLV-021** `sections` — `key` (`hero`, `services`, `methode`, `travaux`, `tarifs`, `faq`, `contact`), `locale`, `heading`, `kicker`, `body` (Tiptap JSON), `sort_order`, `is_visible`, `status` (`draft` | `published`), `published_at`.
- **SLV-022** `services` — `lot_label`, `title`, `summary`, `bullets` (JSONB tableau), `icon_key`, `sort_order`, `status`, `locale`.
- **SLV-023** `process_steps` — `number`, `title`, `description`, `duration`, `sort_order`, `locale`.
- **SLV-024** `projects` — `slug` (unique par locale), `sector`, `title`, `metric_value`, `metric_label`, `stack`, `body` (Tiptap JSON), `cover_media_id`, `gallery` (JSONB), `client_name`, `is_featured`, `sort_order`, `status`, `published_at`, `locale`, plus les champs SEO (`meta_title`, `meta_description`, `og_media_id`).
- **SLV-025** `pricing_plans` — `name`, `price_label`, `price_note`, `includes` (JSONB), `is_highlighted`, `sort_order`, `status`, `locale`.
- **SLV-026** `faq_items` — `question`, `answer` (Tiptap JSON), `sort_order`, `status`, `locale`.
- **SLV-027** `media` — `cloudinary_public_id`, `format`, `width`, `height`, `bytes`, `alt_text` (**obligatoire**, contrainte NOT NULL — un média sans alternative textuelle est refusé), `caption`, `blur_data_url`, `uploaded_by`.
- **SLV-028** `content_revisions` — `entity_type`, `entity_id`, `snapshot` (JSONB de l'état complet), `author_id`, `created_at`. Les 30 dernières révisions par entité sont conservées, puis élagage.
- **SLV-029** `legal_pages` — `slug` (`mentions-legales`, `confidentialite`), `title`, `body`, `locale`, `updated_at`.

### 4.3 Demandes entrantes

- **SLV-030** `leads` — `name`, `email`, `company`, `project_types` (JSONB), `message`, `budget_range`, `locale`, `source` (`web` | `offline_sync`), `status` (`new` | `contacted` | `quoted` | `won` | `lost`), `internal_notes`, `ip_hash`, `user_agent`, `turnstile_ok`, `spam_score`, `client_submitted_at` (horodatage local du navigateur, distinct de `created_at` — indispensable pour les envois différés hors-ligne), `created_at`.
- **SLV-031** `lead_events` — historique d'un lead : changements de statut, emails envoyés, notes.

### 4.4 Policies RLS

- **SLV-035** Contenu publié : lecture anonyme autorisée **uniquement** si `status = 'published'` et `deleted_at IS NULL`. Les brouillons sont invisibles pour le rôle `anon`.
- **SLV-036** Écriture sur toutes les tables de contenu : réservée aux utilisateurs authentifiés présents dans `admin_users` avec `disabled_at IS NULL`.
- **SLV-037** `leads` : **INSERT anonyme autorisé**, SELECT/UPDATE/DELETE strictement interdits au rôle `anon`. Un visiteur ne doit jamais pouvoir lire les demandes des autres.
- **SLV-038** `role = 'editor'` peut modifier et publier le contenu, mais ne peut pas : inviter un utilisateur, changer un rôle, modifier `site_settings`, ni consulter le journal d'audit.
- **SLV-039** Chaque policy est couverte par un test d'intégration qui tente l'accès avec un client `anon`, un client `editor` et un client `owner`, et vérifie les trois résultats attendus. **Une policy non testée est considérée comme absente.**

---

## 5. Authentification et sécurité

### 5.1 Parcours de connexion

- **SLV-040** Connexion par email + mot de passe. Politique : 12 caractères minimum, vérification contre la liste **HaveIBeenPwned** via l'API k-anonymity (on n'envoie que les 5 premiers caractères du hash SHA-1).
- **SLV-041** **MFA TOTP obligatoire** pour tout compte `owner`, et pour `editor` dès la deuxième connexion. Un compte sans MFA enrôlé ne peut accéder qu'à la page d'enrôlement.
- **SLV-042** Codes de récupération : 8 codes à usage unique générés à l'enrôlement, stockés hachés (Argon2id), affichés une seule fois.
- **SLV-043** Limitation de débit progressive sur `/connexion` : 5 tentatives par IP et par email sur 15 minutes, puis blocage exponentiel. Le message d'erreur est **identique** en cas d'email inconnu et de mot de passe incorrect (pas d'énumération de comptes).
- **SLV-044** Sessions en cookies `httpOnly`, `secure`, `sameSite=lax`. Durée de vie 8 heures, rotation du refresh token à chaque usage, révocation immédiate côté serveur à la déconnexion.
- **SLV-045** Réinitialisation de mot de passe par lien signé à usage unique, valide 30 minutes. La réinitialisation **invalide toutes les sessions actives** et notifie par email.
- **SLV-046** Toutes les sessions actives sont listables et révocables individuellement depuis `/admin/parametres`.
- **SLV-047** Réauthentification exigée avant les opérations sensibles : changement d'email, désactivation du MFA, invitation, suppression définitive.

### 5.2 Durcissement de l'application

- **SLV-050** Middleware protégeant `/admin/*` : vérification de session **côté serveur** à chaque requête. Ne jamais se fier à un état client. La garde est également répétée dans chaque Server Action — le middleware seul ne suffit pas.
- **SLV-051** En-têtes de sécurité : `Content-Security-Policy` avec nonce par requête (pas de `unsafe-inline`), `Strict-Transport-Security` avec `preload`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimale, `X-Frame-Options: DENY`.
- **SLV-052** Protection CSRF : les Server Actions de Next.js vérifient l'origine, mais ajouter un contrôle explicite `Origin`/`Host` sur toutes les routes `/api` mutantes.
- **SLV-053** Le contenu Tiptap est stocké en JSON et **rendu côté serveur** via une liste blanche de nœuds. Aucun `dangerouslySetInnerHTML` sur du contenu provenant de la base. Si du HTML est inévitable, passage obligatoire par `isomorphic-dompurify` avec configuration restrictive.
- **SLV-054** Uploads : signature générée côté serveur, types MIME en liste blanche (`image/jpeg`, `image/png`, `image/webp`, `image/avif`, `application/pdf`), taille max 10 Mo, vérification du **magic number** et pas seulement de l'extension, `public_id` généré par le serveur.
- **SLV-055** Rate limiting sur `/api/contact` : 3 requêtes par IP et par heure, 10 par jour. Turnstile vérifié côté serveur. Champ honeypot invisible. Rejet si le formulaire est soumis en moins de 2 secondes.
- **SLV-056** Journalisation d'audit sur **toute** mutation admin : qui, quoi, quand, depuis quelle IP (hachée), avec le diff avant/après.
- **SLV-057** Secrets exclusivement en variables d'environnement, validés au démarrage par un schéma Zod (`src/lib/env.ts`) qui fait échouer le build s'il en manque un. Aucun secret en dur, aucun `.env` commité.
- **SLV-058** `pnpm audit` et un scan Dependabot en CI. Toute vulnérabilité `high` ou `critical` bloque le déploiement.
- **SLV-059** Sauvegarde automatique quotidienne de la base (PITR Supabase activé), avec une procédure de restauration **documentée et testée une fois** dans `docs/RUNBOOK.md`.

---

## 6. Espace admin

### 6.1 Structure

- **SLV-060** Tableau de bord : demandes non traitées, brouillons en attente, dernières modifications, Web Vitals des 7 derniers jours, état du dernier déploiement.
- **SLV-061** Édition de contenu section par section, avec **aperçu en direct côté-à-côté** de la section réelle telle qu'elle apparaîtra en production.
- **SLV-062** Workflow brouillon → publié. Le brouillon est consultable sur le site public via une **URL de prévisualisation signée** (Draft Mode de Next.js), expirant après 24 h.
- **SLV-063** Historique et restauration : chaque enregistrement affiche ses 30 dernières révisions avec diff lisible et bouton « restaurer cette version ».
- **SLV-064** Réordonnancement par glisser-déposer sur les services, étapes, projets, tarifs et FAQ. Persistance immédiate, mise à jour optimiste avec retour arrière en cas d'échec.
- **SLV-065** Bibliothèque de médias : upload multiple, recadrage, **champ `alt` obligatoire à l'upload** (le bouton d'enregistrement reste désactivé sans lui), recherche, remplacement d'un média sans casser les références existantes.
- **SLV-066** Boîte de réception des demandes : liste filtrable, vue détail, changement de statut, notes internes, réponse par email depuis l'interface, export CSV.
- **SLV-067** Sélecteur de palette dans les paramètres : `chaux`, `ardoise` ou `cobalt`, appliqué au site public sans redéploiement.
- **SLV-068** Gestion des traductions : chaque champ traduisible affiche l'état de traduction par langue (`à traduire`, `à jour`, `obsolète` si la source a changé depuis).
- **SLV-069** Journal d'audit consultable et filtrable, accessible au rôle `owner` uniquement.
- **SLV-070** Gestion des utilisateurs : inviter, changer de rôle, désactiver. **Impossible de se retirer soi-même le rôle `owner` s'il n'en reste qu'un** — verrou applicatif *et* contrainte en base.

### 6.2 Qualité d'édition

- **SLV-071** Sauvegarde automatique du brouillon toutes les 10 secondes en cas de modification, avec indicateur d'état explicite (`Enregistré`, `Enregistrement…`, `Échec — réessayer`).
- **SLV-072** Avertissement avant de quitter une page avec des modifications non enregistrées.
- **SLV-073** Verrou d'édition optimiste : si deux personnes éditent la même section, la seconde sauvegarde est refusée avec un diff et un choix explicite, jamais un écrasement silencieux.
- **SLV-074** Raccourcis clavier : `⌘S` enregistrer, `⌘K` palette de commandes, `⌘⇧P` publier.
- **SLV-075** L'admin est utilisable **en lecture seule hors connexion** : le contenu déjà chargé reste consultable, et l'interface indique clairement que l'édition est indisponible.

---

## 7. Mode hors-ligne et PWA

C'est l'exigence la plus discriminante du projet. À traiter comme une fonctionnalité de premier plan, pas comme un vernis.

- **SLV-080** Manifeste web complet : nom, nom court, icônes (192, 512, maskable), `theme_color` aligné sur la palette active, `display: standalone`, `start_url: /?source=pwa`, captures d'écran pour l'invite d'installation.
- **SLV-081** Service worker Serwist avec des stratégies **différenciées par type de ressource** :

  | Ressource | Stratégie | Justification |
  |---|---|---|
  | Coquille applicative, JS, CSS | `CacheFirst` + révision au build | Immuable, hashée |
  | Polices | `CacheFirst`, 1 an | |
  | Images Cloudinary | `StaleWhileRevalidate`, plafond 60 entrées | |
  | Contenu du site (JSON) | `StaleWhileRevalidate` | Affichage instantané, rafraîchissement en fond |
  | Routes admin | `NetworkOnly` | Jamais de contenu privé en cache disque |
  | `POST /api/contact` | File d'attente Background Sync | Le cœur de l'exigence |

- **SLV-082** Page `/hors-ligne` servie en fallback de navigation, cohérente avec l'identité du site (pas la page d'erreur par défaut du navigateur), indiquant ce qui reste consultable.
- **SLV-083** **File d'attente du formulaire de contact.** Envoi hors connexion : la demande est stockée en IndexedDB, l'utilisateur reçoit une confirmation honnête (« Votre demande est enregistrée et partira dès que la connexion revient »), et un Background Sync la rejoue au retour du réseau. Si Background Sync est indisponible (Safari), repli sur un rejeu à la prochaine ouverture de la page.
- **SLV-084** Idempotence des envois : chaque soumission porte un `client_id` (UUID généré au client). Le serveur ignore les doublons. Un rejeu ne doit jamais créer deux leads.
- **SLV-085** Indicateur d'état réseau discret et non anxiogène, plus le nombre d'éléments en attente d'envoi le cas échéant.
- **SLV-086** Mise à jour du service worker : détection de nouvelle version, invitation explicite à recharger (`Une nouvelle version est disponible — Recharger`). Jamais de `skipWaiting` automatique qui remplace le contenu sous les yeux de l'utilisateur.
- **SLV-087** Purge du cache au changement de version, et bouton « vider le cache local » dans les paramètres admin.
- **SLV-088** Tests Playwright avec le réseau coupé (`context.setOffline(true)`) validant : la navigation fonctionne, la soumission est mise en file, et le retour en ligne provoque exactement un lead en base.

---

## 8. Performance

- **SLV-090** Budgets, vérifiés en CI par Lighthouse CI sur la page d'accueil, échec du build en cas de dépassement :

  | Métrique | Budget |
  |---|---|
  | LCP (mobile, 4G simulée) | < 1,8 s |
  | INP | < 200 ms |
  | CLS | < 0,05 |
  | First Load JS, page d'accueil | < 130 ko compressé |
  | Score Lighthouse Performance | ≥ 95 |
  | Score Lighthouse Accessibilité | 100 |

- **SLV-091** Rendu : la vitrine est composée de Server Components. Seuls `PlanCycle`, l'accordéon FAQ, le formulaire et le menu mobile sont des Client Components. Aucun `use client` en haut d'un layout.
- **SLV-092** Cache et invalidation : lectures via `unstable_cache` étiquetées par entité (`content:hero`, `projects:list`…). La publication depuis l'admin déclenche `revalidateTag` ciblé. **Pas de `revalidatePath('/')` global.**
- **SLV-093** Images : `next/image` exclusivement, AVIF puis WebP, `sizes` correct sur chaque image, `priority` sur la seule image du LCP, `blurDataURL` généré à l'upload et stocké en base.
- **SLV-094** Polices : auto-hébergées via `next/font/local`, sous-ensemble latin + latin-ext, `display: swap`, préchargement de la seule graisse utilisée au-dessus de la ligne de flottaison. Bricolage Grotesque et IBM Plex ne sont chargés qu'aux graisses réellement utilisées.
- **SLV-095** Le service worker et l'analytics sont chargés après l'interactivité, jamais dans le chemin critique.
- **SLV-096** `@next/bundle-analyzer` en CI avec commentaire automatique sur la PR indiquant le delta de taille.
- **SLV-097** Requêtes base de données : index sur toutes les colonnes de filtrage (`status`, `locale`, `slug`, `sort_order`, `created_at`). Zéro requête N+1 — vérifié par un test qui compte les requêtes sur le rendu de la page d'accueil (cible : ≤ 3).

---

## 9. SEO, référencement local et partage

- **SLV-100** Metadata API sur chaque route, avec titre et description issus de la base et surchargeables par l'admin.
- **SLV-101** JSON-LD : `LocalBusiness` (adresse bruxelloise, zone desservie Belgique/France/Luxembourg, horaires), `Service` pour chaque lot, `FAQPage`, `BreadcrumbList`, `CreativeWork` sur les études de cas.
- **SLV-102** `sitemap.xml` généré dynamiquement depuis la base, incluant les alternats de langue. `robots.txt` interdisant `/admin` et `/api`.
- **SLV-103** Images Open Graph générées à la volée par `ImageResponse`, déclinées par page, à l'identité du site.
- **SLV-104** `hreflang` correct entre FR, NL et EN, avec `x-default` sur FR.
- **SLV-105** URLs canoniques absolues. Redirection permanente de la variante avec `www` vers le domaine nu, et de `solive.studio` vers `solive.be`.
- **SLV-106** Balisage sémantique strict : un seul `h1` par page, hiérarchie `h2`/`h3` sans saut de niveau, `<main>`, `<nav aria-label>`, `<footer>`. Cela sert autant les lecteurs d'écran que les moteurs conversationnels qui lisent le code plutôt que le rendu.

---

## 10. Accessibilité

- **SLV-110** Navigation clavier complète, ordre de tabulation logique, focus visible et contrasté sur tous les éléments interactifs.
- **SLV-111** Contraste minimum 4,5:1 sur le texte et 3:1 sur les éléments d'interface, **vérifié sur les trois palettes** — c'est le point où le thème clair échoue le plus souvent.
- **SLV-112** `prefers-reduced-motion` respecté : le tracé animé du plan, le bandeau défilant et les révélations au scroll sont désactivés.
- **SLV-113** Formulaires : `label` associé à chaque champ, erreurs annoncées via `aria-live="polite"`, erreurs décrites en texte et pas seulement par la couleur.
- **SLV-114** Lien d'évitement vers le contenu principal. Zones cliquables de 44 × 44 px minimum sur mobile.
- **SLV-115** `axe-core` intégré aux tests Playwright sur chaque page publique et chaque écran admin.

---

## 11. RGPD et conformité belge

- **SLV-120** Bandeau de consentement : refus aussi accessible que l'acceptation, granularité par finalité, choix révocable à tout moment depuis le pied de page. Aucun script non essentiel avant consentement.
- **SLV-121** Analytics respectueux par défaut : Vercel Analytics ou Plausible, sans cookie et sans identifiant individuel. Pas de Google Analytics sauf demande explicite.
- **SLV-122** Politique de confidentialité et mentions légales éditables depuis l'admin, avec les mentions obligatoires belges : dénomination, numéro d'entreprise BCE, numéro de TVA, siège, contact, mode de règlement des litiges.
- **SLV-123** Conservation des données : les leads sont anonymisés après 36 mois, les `login_attempts` purgés à 30 jours, les logs d'audit conservés 24 mois. Tâche planifiée (cron Vercel) et testée.
- **SLV-124** Export et suppression d'un lead sur demande, en un clic depuis l'admin, avec trace dans le journal d'audit.
- **SLV-125** Les adresses IP ne sont **jamais stockées en clair** — uniquement un hash salé, à des fins d'anti-abus.

---

## 12. Emails transactionnels

- **SLV-130** Notification interne à chaque nouvelle demande, avec le contenu complet et un lien direct vers la fiche dans l'admin.
- **SLV-131** Accusé de réception automatique au prospect, en sa langue, annonçant un délai de réponse réaliste.
- **SLV-132** Emails d'invitation, de réinitialisation de mot de passe et d'alerte de connexion depuis un nouvel appareil.
- **SLV-133** Templates en `react-email`, testés au rendu par snapshot, avec version texte brut systématique.
- **SLV-134** SPF, DKIM et DMARC configurés sur le domaine — sinon les accusés de réception finissent en spam et le formulaire ne sert à rien. À documenter dans le RUNBOOK.

---

## 13. Tests

- **SLV-140** Unitaires (Vitest) : schémas Zod, utilitaires, `Result<T,E>`, rendu Tiptap, logique de la file hors-ligne.
- **SLV-141** Intégration : Server Actions avec une vraie base Postgres jetable (Testcontainers ou branche Supabase dédiée), **jamais de mock de la base pour les tests RLS**.
- **SLV-142** Tests RLS dédiés, un fichier par table, couvrant les trois rôles (`anon`, `editor`, `owner`) sur les quatre opérations.
- **SLV-143** MSW pour simuler Resend, Cloudinary, Turnstile, Upstash et HaveIBeenPwned. Aucun appel réseau réel en test.
- **SLV-144** E2E Playwright : parcours prospect complet (arrivée → lecture → envoi de demande → confirmation), parcours admin complet (connexion + MFA → édition → prévisualisation → publication → vérification en production), et le parcours hors-ligne de SLV-088.
- **SLV-145** Fixtures en pattern builder pour chaque entité, comme dans le projet Traballo.
- **SLV-146** Tests de sécurité explicites : tentative d'accès admin sans session, tentative de lecture d'un brouillon en anonyme, tentative de lecture des leads en anonyme, injection dans le contenu Tiptap, upload d'un fichier au MIME falsifié. Chacun **doit** échouer.

---

## 14. CI/CD et exploitation

- **SLV-150** Pipeline GitHub Actions : `lint` → `typecheck` → `test:unit` → `test:integration` → `build` → `lighthouse` → `test:e2e`. Échec sur n'importe quelle étape = pas de merge.
- **SLV-151** Déploiements de prévisualisation Vercel sur chaque PR, avec une branche Supabase éphémère et migrations appliquées automatiquement.
- **SLV-152** Migrations : jamais destructives en une seule étape. Ajout de colonne → remplissage → bascule du code → suppression de l'ancienne colonne, en déploiements séparés.
- **SLV-153** Sentry avec source maps chargées au build, alerte sur toute nouvelle erreur en production, et sur un taux d'erreur dépassant 1 %.
- **SLV-154** Endpoint `/api/health` vérifiant la base, Redis et Cloudinary, surveillé par un moniteur externe.
- **SLV-155** `docs/RUNBOOK.md` couvrant : rotation des secrets, restauration de sauvegarde, retour arrière de déploiement, procédure en cas de compromission de compte admin.

---

## 15. Phases d'exécution

L'agent suit cet ordre. Chaque phase se termine par une PR verte et une entrée dans `docs/ADR/`.

**Phase 1 — Fondations (SLV-001 à 008, 057, 150)**
Initialisation du projet, TypeScript strict, validation d'environnement, Tailwind et tokens des trois palettes, structure de dossiers, CI minimale, `Result<T,E>`.
*Acceptation :* `pnpm build` et `pnpm test` passent sur un projet vide, la CI est verte, un secret manquant fait échouer le build.

**Phase 2 — Données et RLS (SLV-010 à 039)**
Schéma Drizzle complet, migrations, policies RLS, seed de développement, tests RLS pour les trois rôles.
*Acceptation :* tous les tests RLS passent. Un client anonyme ne peut lire aucun brouillon et aucun lead.

**Phase 3 — Authentification (SLV-040 à 059)**
Connexion, MFA TOTP, codes de récupération, rate limiting, sessions, middleware, en-têtes de sécurité, journal d'audit.
*Acceptation :* les cinq tests de sécurité de SLV-146 échouent comme attendu. Un compte sans MFA ne peut atteindre que la page d'enrôlement.

**Phase 4 — Vitrine (SLV-091 à 106, 110 à 115)**
Découpage de `solive-site.jsx` en Server Components, lecture du contenu depuis la base, SEO, JSON-LD, accessibilité.
*Acceptation :* Lighthouse Performance ≥ 95 et Accessibilité 100. Le rendu est visuellement identique à la maquette sur les trois palettes.

**Phase 5 — Admin CMS (SLV-060 à 075)**
Tableau de bord, édition par section, Tiptap, prévisualisation, révisions, glisser-déposer, médias, boîte de réception.
*Acceptation :* modifier chaque section depuis l'admin, publier, et voir le changement en production en moins de 5 secondes sans redéploiement.

**Phase 6 — Formulaire et emails (SLV-030, 055, 130 à 134)**
Route de contact, Turnstile, rate limiting, notification interne, accusé de réception, gestion des leads.
*Acceptation :* un envoi crée un lead, envoie deux emails, et un sixième envoi depuis la même IP est rejeté.

**Phase 7 — Hors-ligne et PWA (SLV-080 à 088)**
Manifeste, Serwist, stratégies de cache, page hors-ligne, file IndexedDB, Background Sync, idempotence.
*Acceptation :* le test Playwright hors-ligne de SLV-088 passe. Aucune route admin n'apparaît dans le cache disque — vérifié par inspection du Cache Storage.

**Phase 8 — i18n et conformité (SLV-100 à 125)**
next-intl, traductions FR/NL/EN, hreflang, bandeau de consentement, pages légales, rétention des données.
*Acceptation :* aucun cookie non essentiel avant consentement, vérifié par un test Playwright qui inspecte `document.cookie` au premier chargement.

**Phase 9 — Durcissement et mise en production (SLV-090, 096, 151 à 155)**
Budgets Lighthouse en CI, analyse de bundle, Sentry, health check, RUNBOOK, domaine et emails.
*Acceptation :* tous les budgets de SLV-090 respectés, SPF/DKIM/DMARC valides, une restauration de sauvegarde effectuée pour de vrai.

---

## 16. Definition of Done

Une exigence est terminée quand, et seulement quand :

1. Un test échouait avant l'implémentation et passe après.
2. Les types sont stricts, sans `any` ni `@ts-ignore`.
3. Le comportement est accessible au clavier et au lecteur d'écran.
4. Le cas d'erreur est traité et affiché dans la langue de l'utilisateur, avec une action de sortie.
5. La mutation, si elle en est une, est journalisée dans l'audit.
6. Le budget de performance n'a pas régressé.
7. Une entrée ADR existe si un choix d'architecture a été fait.

---

## 17. Instructions de travail pour l'agent

- Répartition sur les sous-agents existants : **architect** valide chaque schéma et chaque frontière avant écriture ; **database-engineer** prend les phases 2 et les migrations ; **api-developer** les Server Actions et routes ; **frontend-developer** les phases 4, 5 et 7 ; **tdd-engineer** écrit les tests en premier sur chaque exigence ; **security-reviewer** relit obligatoirement les phases 3, 6 et 9 avant merge.
- Un commit par exigence, message au format `feat(SLV-042): codes de récupération MFA`.
- Ne jamais désactiver un test pour faire passer la CI. Si un test est faux, le corriger ou le supprimer avec justification en PR.
- Ne jamais introduire de dépendance sans l'ajouter à la table de la section 1 et justifier en une ligne dans l'ADR.
- Si une exigence entre en conflit avec une autre, s'arrêter et demander l'arbitrage. Ne pas trancher seul.
