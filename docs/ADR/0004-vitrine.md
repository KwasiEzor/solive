# ADR 0004 — Vitrine

- **Statut :** accepté
- **Date :** 2026-08-18
- **Phase :** 4 (SLV-091 à 106, 110 à 115)

## Fait

1. **Découpage `solive-site.jsx` → Server Components** (SLV-091). RSC par défaut ;
   seuls `PlanCycle`, `Nav`, `Faq`, `Contact` sont des Client Components. Aucun
   `use client` en tête de layout.
2. **Contenu depuis la base** : couche `src/server/queries/content.ts`, lectures
   `unstable_cache` étiquetées par entité (`content:sections`, `content:services`,
   …) pour un `revalidateTag` ciblé à la publication (SLV-092). Filtre explicite
   published + non supprimé (aligné RLS).
3. **Polices auto-hébergées** via `next/font/google` (Bricolage Grotesque + IBM
   Plex Sans/Mono), sous-ensembles latin + latin-ext, `display: swap`, graisses
   réellement utilisées (SLV-094). Pas de requête Google au runtime.
4. **Styles** portés de la maquette dans `src/styles/site.css` (scopé `.site`),
   palettes dans `tokens.css`, appliquées via `t-<palette>` depuis les réglages.
5. **SEO** : Metadata API par route, `metadataBase`, canonliques ; JSON-LD
   `LocalBusiness` + `Service` + `FAQPage` (accueil) et `CreativeWork` (études de
   cas) — SLV-100/101. `robots.ts` (interdit /admin, /api), `sitemap.ts` généré
   depuis la base, `manifest.ts` (icônes en phase 7).
6. **Accessibilité AA** (SLV-110-115) : lien d'évitement, un seul `h1`,
   landmarks `<main>`/`<nav aria-label>`/`<footer>`, `prefers-reduced-motion`.
   Vérifié par axe-core dans Playwright — **zéro violation serious/critical**.
7. **Contraste** (SLV-111) : `--dim`/`--dim2` relevés à ≥ 4.5:1 sur les trois
   palettes ; correction d'un bug de spécificité (`.site a{color:inherit}`
   écrasait la couleur des boutons pleins → texte sombre sur vert).
8. Pages `/travaux/[slug]` (étude de cas), `/mentions-legales`,
   `/confidentialite` (contenu éditable en phase 8).

## Rendu

- Accueil **statique** (contenu figé au build, revalidé par tag à la
  publication). Vérifié visuellement : rendu conforme à la maquette (palette
  chaux, plan animé, typo).

## Reste / phases ultérieures

- `hreflang` FR/NL/EN et traductions : phase 8 (i18n). La vitrine est FR pour
  l'instant.
- Budgets Lighthouse en CI (LCP < 1,8 s, Perf ≥ 95, A11y 100) : phase 9
  (SLV-090). Test N+1 ≤ 3 requêtes (SLV-097) : à ajouter.
- Rendu Tiptap serveur en liste blanche (SLV-053) : phase 5 ; la FAQ affiche le
  texte brut pour l'instant.
