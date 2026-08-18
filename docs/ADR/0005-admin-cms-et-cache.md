# ADR 0005 — Admin CMS (spine) et invalidation de cache

- **Statut :** accepté (spine) — modules restants en cours
- **Date :** 2026-08-18
- **Phase :** 5 (SLV-060 à 075)

## Fait (spine d'édition)

1. **Rendu Tiptap serveur en liste blanche** (`src/lib/tiptap/render.tsx`,
   SLV-053) : parcours du JSON, nœuds/marques whitelistés, liens `http(s)`/
   `mailto` uniquement (`javascript:` rejeté), **aucun `dangerouslySetInnerHTML`**.
   Testé (injection, marques, nœuds inconnus).
2. **Éditeur de section** (`/admin/contenu/[section]`, SLV-061) : formulaire
   kicker/titre + éditeur riche Tiptap + **aperçu en direct côte à côte**.
3. **Brouillon → publié** (SLV-062) via Server Actions `saveSectionAction`
   (autosave), `publishSectionAction`/`unpublishSectionAction`. Verrou d'édition
   optimiste par `updated_at` (SLV-073, refus d'écrasement silencieux).
4. **Révisions** (SLV-063) : snapshot avant chaque écriture, élagage aux 30
   dernières, restauration.
5. **Qualité d'édition** : autosave 10 s + indicateur d'état (SLV-071),
   avertissement avant de quitter (SLV-072), raccourcis ⌘S / ⌘⇧P (SLV-074).
6. **Audit** sur chaque mutation (SLV-056) ; gardes `requireAdmin` répétées.

## Décision de cache (SLV-092)

`revalidateTag` de Next 16 exige désormais un profil et ne fait plus
d'invalidation immédiate à un argument. On adopte donc le modèle **Cache
Components** :

- `nextConfig.cacheComponents = true` ;
- lectures publiques en `"use cache"` + `cacheTag('content:<entité>')`
  (`src/server/queries/content.ts`) ;
- publication → `updateTag('content:<entité>')` : invalidation ciblée immédiate,
  **jamais** `revalidatePath('/')` global.

Conséquence : les routes qui lisent des données runtime (cookies d'auth) sont
marquées `export const instant = false` (blocking, hors prérendu). La vitrine
reste **statique** (PPR) ; les études de cas sont prérendues via
`generateStaticParams`.

## Reste (Phase 5)

- Tableau de bord complet (SLV-060), réordonnancement glisser-déposer (SLV-064),
  bibliothèque de médias Cloudinary (SLV-065 — **nécessite les identifiants
  Cloudinary**), boîte de réception des demandes (SLV-066), sélecteur de palette
  (SLV-067), état de traduction (SLV-068), journal d'audit (SLV-069), gestion des
  utilisateurs (SLV-070), admin lecture seule hors-ligne (SLV-075, phase 7).
- Affichage du corps Tiptap des sections sur la vitrine (actuellement seuls
  kicker/titre sont rendus).
- **Vérification d'acceptation** (éditer → publier → visible en < 5 s) : à faire
  en cliquant dans l'admin avec un compte owner (`pnpm seed:owner`).
