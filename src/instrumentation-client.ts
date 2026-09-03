import * as Sentry from "@sentry/nextjs";

// Browser-side observability (SLV, Phase 9). No-ops when
// NEXT_PUBLIC_SENTRY_DSN is unset. Once a real Sentry project exists, its
// ingest origin must be added to connect-src in src/lib/security-headers.ts
// (this CSP has no wildcard — a strict allowlist) or requests are blocked.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
