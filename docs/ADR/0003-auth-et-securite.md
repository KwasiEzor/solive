# ADR 0003 — Authentification et sécurité

- **Statut :** accepté (fondations) — flux UI en cours
- **Date :** 2026-08-18
- **Phase :** 3 (SLV-040 à 059)

## Fait

1. **Client Supabase** en 3 variantes : serveur (cookies, RLS), navigateur
   (anon/publishable — SLV-003), admin (service_role, bypass RLS, server-only).
2. **Middleware** (`src/middleware.ts`, SLV-050/051/052) : nonce CSP par requête
   + en-têtes de sécurité complets (HSTS preload, nosniff, Referrer-Policy,
   Permissions-Policy, X-Frame-Options DENY, CSP sans `unsafe-inline`), refresh
   de session côté serveur, garde `/admin` → `/connexion`, contrôle Origin/Host
   sur `/api` mutant.
3. **Gardes Server Action** (`src/server/auth/guards.ts`) : `requireAdmin` /
   `requireOwner` re-vérifiées à chaque action (le middleware ne suffit pas).
4. **Politique mot de passe** (SLV-040) : Zod ≥ 12 caractères + vérification
   **HaveIBeenPwned k-anonymity** (`hibp.ts`) — seul le préfixe SHA-1 (5 car.)
   part.
5. **Codes de récupération** (SLV-042) : 8 codes usage unique, hachés Argon2id,
   affichés une fois (`recovery-codes.ts`).
6. **Throttling connexion** (SLV-043) : fonction pure `evaluateLoginThrottle`
   (5 échecs / 15 min par IP+email, backoff exponentiel), au-dessus de
   `login_attempts`.
7. **Hachage salé IP/email** (SLV-125) : `hash.ts`, HMAC-SHA256, jamais d'IP en
   clair. Salt `IP_HASH_SALT`.
8. **Journal d'audit** (SLV-056) : `writeAudit` via service_role sur la table
   append-only.
9. **Amorçage owner** (SLV-001) : `pnpm seed:owner`, une seule fois, refuse s'il
   existe déjà un owner. Aucune inscription publique.
10. **Tests RLS live** : les 15 tests de `rls.test.ts` passent contre la vraie
    base via le pooler Supavisor.

## Décisions techniques

- **Connexion base via le pooler Supavisor** (`aws-0-eu-central-1.pooler…:5432`)
  et non l'hôte direct `db.<ref>.supabase.co` : ce dernier n'a que des
  enregistrements AAAA (IPv6) et ne résout pas sur les réseaux IPv4. `ssl:
  require`, `prepare: false`.
- Argon2id via `@node-rs/argon2` (binaire prébuilt, pas de compilation).

## Complété (2e passe)

- Flux connexion `/connexion` (2 étapes) + MFA TOTP + enrôlement obligatoire
  `/mfa` (SLV-041).
- Réinitialisation mot de passe : `/mot-de-passe-oublie` + `/reinitialiser` via
  callback PKCE `/auth/callback`, politique 12+ & HIBP, révocation des autres
  sessions (SLV-045).
- Sessions : liste + révocation individuelle/globale dans `/admin/parametres`
  (lecture directe de `auth.sessions`, SLV-046).
- Réauthentification `reauthenticateAction` + garde `requireRecentReauth`
  (cookie 5 min) pour les opérations sensibles (SLV-047).
- E2E Playwright (`tests/e2e/security.spec.ts`) : garde /admin, garde /mfa,
  en-têtes de sécurité, non-cache admin — 5 tests verts (SLV-146). Intégré à la
  CI.

## Dette / suivi

- Next 16 déprécie le nom de fichier `middleware` au profit de `proxy` (le brief
  impose `src/middleware.ts`) — migration à planifier.
- MFA « dès la 2e connexion » pour `editor` et login par code de récupération :
  non encore câblés (infra présente).
