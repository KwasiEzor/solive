# ADR 0008 — Formulaire de contact & emails

- **Statut :** accepté (cœur) — clés externes en attente
- **Date :** 2026-08-19
- **Phase :** 6 (SLV-030, 055, 130-134)

## Décisions

1. **Email transactionnel : Brevo** (au lieu de Resend). Motif client : le
   quota gratuit Resend est déjà utilisé sur un autre projet. Brevo est
   français/UE (RGPD, aligné « données en Europe »), 300 emails/jour gratuits.
   **Couche email agnostique** : interface `Mailer` + adaptateur `BrevoMailer`
   (HTTP, sans SDK) ; changer de fournisseur = un fichier. Templates
   `react-email` (SLV-133), version texte systématique.
2. **Rate limiting : Upstash Redis** provisionné via **Vercel Marketplace**
   (variables `KV_*`). Fenêtres glissantes 3/h et 10/jour par IP hachée
   (SLV-055). Fail-open si non configuré (dev) — les autres barrières restent.
3. **Anti-spam en couches** (SLV-055) : Zod, honeypot (`website` vide), rejet
   < 2 s, Turnstile vérifié côté serveur, rate limit. Contrôle Origin/Host déjà
   assuré par le middleware (SLV-052).
4. **Idempotence** (SLV-084) : `client_id` (UUID client) unique ; `INSERT …
   ON CONFLICT DO NOTHING` — un rejeu ne crée jamais deux leads ni deux emails.
5. **Route** `POST /api/contact` : validation → timing → rate limit → Turnstile
   → lead idempotent (+ `lead_event`) → 2 emails best-effort (notification
   interne SLV-130 + accusé localisé FR/NL/EN SLV-131) → audit.
6. **Formulaire** : `client_id`, honeypot invisible, mesure du temps, widget
   Turnstile (si clé), POST réel ; message hors-ligne (la file IndexedDB +
   Background Sync arrive en Phase 7).

## Vérifié

- 70 unit/integration (schema, Turnstile MSW, Brevo MSW, rendu emails FR/NL/EN)
  + 18 e2e dont les barrières `/api/contact` (CSRF 403, honeypot 400, < 2 s 400)
  sans aucune clé externe. Couverture 97 %/90 %.

## Reste pour la mise en service

- **Clés à fournir** : `BREVO_API_KEY` + `EMAIL_FROM`/`EMAIL_TO` (compte Brevo) ;
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` + `TURNSTILE_SECRET_KEY` (Cloudflare).
- **Restaurer** `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_DB_URL` (écrasés par un
  `vercel env pull`).
- SPF/DKIM/DMARC sur le domaine (SLV-134) — Phase 9, une fois le domaine acheté.
