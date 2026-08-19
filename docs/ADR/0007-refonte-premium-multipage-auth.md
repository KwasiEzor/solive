# ADR 0007 — Refonte premium, IA multi-pages, auth de confiance

- **Statut :** accepté
- **Date :** 2026-08-19
- **Demande client** (remplace la fidélité à la maquette, Phase 4)

## Contexte

Le client (propriétaire du studio) a jugé la palette d'origine « fade » et a
demandé un rendu premium, une navigation par pages dédiées et des pages d'auth
« dignes de confiance ». Décisions validées : direction **dark raffinée**,
**pages curées**, **3 palettes conservées** (toutes premium).

## Décisions

1. **Palettes premium** (`tokens.css`) — 3 thèmes commutables, chacun avec
   tokens de profondeur (`--shadow-*`, `--glow`, `--grad-hero`, `--card-grad`) :
   - **ardoise** (défaut / signature) : encre profonde + accent menthe (#34e4a1).
   - **chaux** : blanc chaud éditorial + vert profond.
   - **cobalt** : bleu nuit + ambre.
   Contraste AA vérifié (axe) sur toutes les pages, thème par défaut compris.
2. **Profondeur** (`site.css`) : cartes élevées (ombre + dégradé de surface +
   lift au survol), boutons à dégradé + halo, nav vitrée, hero à halo radial,
   rayons revus. Bandeau d'appel à l'action (`.cta-band`).
3. **IA multi-pages curée** : `/services`, `/realisations`, `/tarifs`,
   `/contact` deviennent de vraies pages (metadata + JSON-LD + canonical
   propres) ; la nav pointe vers ces routes ; l'accueil reste une vue d'ensemble
   et se clôt par le bandeau CTA (le formulaire vit désormais sur `/contact`).
   Composants de section dotés de `hideHead` pour une hiérarchie h1/h2 propre.
4. **Auth de confiance** (`AuthShell`) : mise en page en deux colonnes (marque +
   **messages de sécurité réels** : TLS, MFA TOTP, sessions révocables, contrôle
   HIBP), champ mot de passe avec afficher/masquer, **jauge de robustesse**,
   alerte **verrou majuscules**. Appliqué à connexion, MFA, réinitialisation.
   Aucun faux signal de confiance.

## Écarts assumés (validés client)

- Remplace « visuellement identique à la maquette » (acceptation Phase 4).
- IA multi-pages au lieu de la vitrine mono-page (§3 du BRIEF).

## Vérification

- 15 tests e2e verts, dont axe (0 violation serious/critical) sur `/`,
  `/services`, `/realisations`, `/tarifs`, `/contact`, `/connexion`.
- 71 tests unit/integration verts.
