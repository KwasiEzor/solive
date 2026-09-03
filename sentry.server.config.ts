import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Low sample rate — this is a small marketing site + admin, not a
  // high-throughput app; keep ingestion volume (and cost) proportionate.
  tracesSampleRate: 0.1,
});
