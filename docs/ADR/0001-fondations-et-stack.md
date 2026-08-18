# ADR 0001 — Fondations et stack

- **Statut :** accepté
- **Date :** 2026-08-18
- **Phase :** 1 (SLV-001 à 008, 057, 150)

## Contexte

Amorçage du projet Solive : vitrine + admin CMS, web app hors-ligne. La stack
est imposée par la section 1 du BRIEF. Ce document enregistre les choix de
fondation et les écarts assumés par rapport au brief.

## Décisions

1. **Scaffold** via `create-next-app` (App Router, `src/`, TS strict, Tailwind,
   ESLint, Turbopack, pnpm).
2. **TypeScript strict renforcé** : au-delà de `strict`, on active
   `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`,
   `noFallthroughCasesInSwitch`, `forceConsistentCasingInFileNames`. Aucun
   `any` ni `@ts-ignore` (DoD §2).
3. **`Result<T,E>`** (`src/lib/result.ts`) : les Server Actions et services
   renvoient un résultat explicite plutôt que de lever (SLV-140).
4. **Validation d'environnement** (`src/lib/env.ts`) : schéma Zod évalué à
   l'import ; une variable requise manquante fait échouer le build (SLV-057).
   Les vars par intégration sont ajoutées au schéma dans leur phase.
5. **Tokens des 3 palettes** (`src/styles/tokens.css`) : `chaux`, `ardoise`,
   `cobalt`, appliquées via une classe `t-<palette>` sur `<html>` (SLV-020/067).
6. **Tests** : Vitest, alias `@`, seuils de couverture 80 % lignes/branches sur
   `src/lib`, `src/server`, `src/app/api` (SLV-007).
7. **CI** (`.github/workflows/ci.yml`) : lint → typecheck → test → build →
   audit. Les étapes integration / lighthouse / e2e sont ajoutées dans leurs
   phases respectives (SLV-150).

## Écarts assumés vs BRIEF (à valider)

- **Next.js 16.3** au lieu de **15**. `create-next-app@latest` installe la
  version courante 2026. Next 16 est un sur-ensemble compatible de 15 (App
  Router, RSC, `strict`) ; aucune exigence n'en dépend. **À confirmer** ; retour
  possible sur `next@15` si souhaité.
- **Tailwind CSS v4** (config CSS-first via `@theme`, pas de `tailwind.config`).
  Le brief dit « Tailwind CSS » sans version ; v4 est l'actuelle.
- **Zod v4** (dernière majeure).

## Conséquences

- `pnpm build`, `pnpm test`, `pnpm typecheck`, `pnpm lint` passent sur le
  squelette.
- Une variable d'env requise manquante casse le build (vérifié par test unitaire
  + comportement au chargement).
