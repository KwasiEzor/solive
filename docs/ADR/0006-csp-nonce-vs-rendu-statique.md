# ADR 0006 — CSP à nonce par requête vs rendu statique

- **Statut :** accepté
- **Date :** 2026-08-18
- **Phase :** 4/5 (correctif) — SLV-051 vs SLV-091

## Contexte

Bug découvert en testant `/connexion` : **la CSP bloquait tout le JavaScript de
Next** (chunks + scripts inline de l'hydratation). Aucune page ne s'hydratait —
formulaire de connexion inopérant, menu mobile figé, etc.

**Cause racine :** un **nonce CSP par requête** (SLV-051) est incompatible avec
le **prérendu statique** (SLV-091). Le HTML statique est généré au build avec un
nonce (ou aucun), mais le middleware pose un nonce frais à chaque requête → tous
les scripts sont rejetés (`strict-dynamic` sans nonce correspondant).

C'est le type de conflit d'exigences que le brief demande d'arbitrer.

## Décision

**Priorité à la sécurité (SLV-051)** : on conserve le nonce par requête, sans
`unsafe-inline`. Conséquence : l'application est **rendue dynamiquement**.

- `next.config` : retour à `unstable_cache` (retrait de `cacheComponents`).
- `src/app/layout.tsx` : `await headers()` dans le layout racine → rendu par
  requête ; Next applique alors le nonce du header CSP de la requête à ses
  `<script>` (nonce header == nonce scripts, vérifié).
- Le middleware pose la CSP (avec nonce) sur les en-têtes **de requête** ET de
  réponse.
- Les données publiques restent en cache (`unstable_cache`, tags par entité), la
  perte porte sur le HTML statique, pas sur les requêtes DB.

## Compromis (à valider si besoin)

- La vitrine n'est plus **statique** mais **SSR + données en cache**. Le LCP
  dépend donc du SSR ; à mesurer contre les budgets SLV-090 en phase 9. Si les
  budgets ne passent pas, deux pistes : (a) profil CSP distinct — nonce sur
  `/admin` (déjà dynamique), CSP à base de hash pour la vitrine statique ; (b)
  cache de rendu (edge) devant le SSR.
- Invalidation à la publication : `revalidateTag('content:<entité>', 'max')`
  (Next 16 impose un profil au 2ᵉ argument).

## Garde anti-régression

Le trou venait de tests e2e ne vérifiant que le HTML statique. Ajout dans
`tests/e2e/vitrine.spec.ts` :

- hydratation d'un Client Component (accordéon FAQ : `aria-expanded` bascule) ;
- **zéro violation CSP** dans la console au chargement.
