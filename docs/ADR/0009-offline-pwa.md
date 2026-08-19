# ADR 0009 — Mode hors-ligne & PWA

- **Statut :** accepté
- **Date :** 2026-08-19
- **Phase :** 7 (SLV-080 à 088)

## Décisions

1. **Serwist** (`@serwist/next`) pour le service worker (`src/sw.ts`) — précache
   de la coquille, `defaultCache` (stratégies différenciées par ressource),
   fallback de navigation vers `/hors-ligne`, `clientsClaim`, **pas** de
   `skipWaiting` automatique.
2. **Build webpack** : `@serwist/next` ne supporte pas Turbopack (défaut de
   Next 16). Le script `build` passe `--webpack`. Le dev reste Turbopack (SW
   désactivé en dev). `reloadOnOnline: false` (ne pas recharger pendant un envoi
   différé).
3. **File hors-ligne** (`src/lib/offline/`) : IndexedDB (`idb`), clé = `client_id`
   (idempotence SLV-084). `submitContact` met en file si hors-ligne ou sur échec
   réseau, avec confirmation honnête. Rejeu par **Background Sync** (SW) et repli
   par **flush à l'ouverture / au retour du réseau** (Safari, SLV-083). Le flush
   retente périodiquement tant que la file n'est pas vide (robuste au retour de
   connexion qui devance l'évènement `online`).
4. **Middleware** : le rejeu SW (sans en-tête Origin) est autorisé via l'en-tête
   `x-solive-replay` — infalsifiable en cross-origin (préflight CORS).
5. **Indicateur réseau** discret + nombre d'éléments en attente (SLV-085).
   **Invite de mise à jour** explicite « Recharger » ; rechargement uniquement
   après acceptation, jamais au `clientsClaim` initial (SLV-086).
6. **Purge de cache** : bouton « vider le cache local » dans les paramètres
   (SLV-087). Serwist purge les précaches obsolètes au changement de révision.
7. **Manifeste** (SLV-080) : icônes SVG (any + maskable), `theme_color` suivant
   la palette active, `display: standalone`, `start_url: /?source=pwa`.

## Vérifié

- E2E Playwright (`offline.spec.ts`, SLV-088) : le SW s'enregistre ; hors-ligne,
  la soumission est mise en file (confirmation « HORS LIGNE ») ; au retour du
  réseau la file se vide et **exactement un lead** est créé en base (idempotence
  vérifiée). Le rendu offline (in-app pane) ne supporte pas les SW ; la
  vérification fait foi via Chromium réel.
- 85 unit/integration + 20 e2e verts.

## Dette / suivi

- Icônes en SVG (installable) ; PNG 192/512 rastérisés pour compatibilité maximale
  = polish phase 9. Captures d'écran du manifeste : idem.
- Le rate-limit Upstash (SLV-055) s'applique au rejeu ; les tests locaux répétés
  épuisent le quota jour d'une même IP hachée (CI = infra jetable, SLV-151).
