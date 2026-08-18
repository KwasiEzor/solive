# RUNBOOK — Solive

Procédures d'exploitation. Complété au fil des phases (SLV-155).

## À documenter (phases ultérieures)

- [ ] Rotation des secrets (SLV-057)
- [ ] Restauration de sauvegarde PITR Supabase, testée une fois (SLV-059)
- [ ] Retour arrière de déploiement Vercel (SLV-155)
- [ ] Procédure en cas de compromission d'un compte admin (SLV-155)
- [ ] Configuration SPF / DKIM / DMARC du domaine (SLV-134)

## Développement local

```bash
cp .env.example .env   # renseigner les variables
pnpm install
pnpm dev
```

## Vérifications avant PR

```bash
pnpm lint && pnpm typecheck && pnpm test:coverage && pnpm build
```
