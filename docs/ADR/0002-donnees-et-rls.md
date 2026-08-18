# ADR 0002 — Données et RLS

- **Statut :** accepté
- **Date :** 2026-08-18
- **Phase :** 2 (SLV-010 à 039)

## Contexte

Schéma complet, migrations, policies RLS et seed de développement, avant toute
UI. Base : Supabase Postgres 17, projet `solive` (`dqomchzwveumobgtvnph`), région
`eu-central-1` (Francfort — données en Europe, aligné sur Vercel `fra1`).

## Décisions

1. **16 tables** (§4 du BRIEF) définies dans `drizzle/schema.ts` (source de
   vérité des formes + typage app). Conventions respectées : snake_case en base,
   camelCase en TS, PK `uuid` v7, `created_at`/`updated_at`, `deleted_at` sur le
   contenu.
2. **UUID v7 applicatif** : PG17 n'a pas `uuidv7()` natif et l'extension
   `pg_uuidv7` est absente. Fonction SQL `public.uuid_generate_v7()`
   (implémentation Fabio Lima, version/variant RFC 4122 corrects) comme défaut de
   PK. Vérifiée : nibble de version = 7.
3. **Migrations SQL versionnées** dans `drizzle/migrations/` et appliquées à
   Supabase. Choix d'écrire le SQL à la main plutôt que `drizzle-kit generate` :
   RLS, fonctions, triggers et défaut uuid v7 sortent du périmètre du générateur.
   `drizzle/schema.ts` reste aligné pour l'ORM et le typage.
   - `0001_init` — fonctions, enums, tables, index (SLV-097), triggers
     `updated_at`, immutabilité `audit_log` (trigger `forbid_mutation`).
   - `0002_rls` — RLS activé sur **toutes** les tables + policies (SLV-035→038),
     helpers `is_admin()`/`is_owner()` en `SECURITY DEFINER` (évite la récursion
     de policy sur `admin_users`), seed du singleton `site_settings`.
   - `0003_harden_functions` — `search_path` figé sur les fonctions (advisor 0011).
4. **RLS (SLV-035→039)** vérifié en direct par impersonation de rôle SQL :
   - anon lit le contenu **publié** uniquement, jamais les brouillons ;
   - anon **ne lit aucun lead**, mais peut en **insérer** un ;
   - anon ne peut pas écrire le contenu ;
   - `audit_log` : UPDATE et DELETE bloqués même pour le propriétaire ;
   - editor ≠ owner : editor ne peut ni écrire `site_settings` ni inviter.
5. **Tests RLS** (`tests/integration/rls.test.ts`, SLV-141/142) : Postgres réel
   via `SUPABASE_DB_URL`, transactions systématiquement annulées, impersonation
   anon/editor/owner. Skippés tant que `SUPABASE_DB_URL` n'est pas fourni.
6. **Client Drizzle** `src/server/db` (postgres-js, `prepare:false` pour
   pgbouncer), construit paresseusement (import-safe sans DB URL). Typage infra
   exclu de la couverture unitaire (couvert par les tests d'intégration).
7. **Seed de dev** (`drizzle/seed/dev.sql`) : contenu FR publié repris de la
   maquette (7 sections, 3 services, 4 étapes, 3 projets, 3 tarifs, 5 FAQ),
   appliqué à la base.

## Écarts / dette

- `is_admin()`/`is_owner()` sont appelables via RPC PostgREST (advisor WARN) :
  **volontaire** — elles ne renvoient qu'un booléen sur l'appelant, et le rôle
  `anon` a besoin d'`EXECUTE` pour l'évaluation des policies de lecture publique.
- Types Supabase (`supabase-js`) générés en Phase 3 avec le client d'auth ; le
  typage actuel vient des `$infer` de Drizzle.
- `SUPABASE_DB_URL` et `SUPABASE_SERVICE_ROLE_KEY` à renseigner (dashboard) pour
  activer les tests RLS en CI et les branches Supabase éphémères (SLV-151).
