import type { Instrumentation } from "next";

/**
 * Server/edge observability (SLV, Phase 9). No-ops cleanly when
 * NEXT_PUBLIC_SENTRY_DSN is unset (local dev, CI, before the Sentry project
 * exists) — Sentry.init() with dsn: undefined disables sending without
 * throwing. See src/instrumentation-client.ts for the browser side.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export const onRequestError: Instrumentation.onRequestError = async (
  err,
  request,
  context,
) => {
  const Sentry = await import("@sentry/nextjs");
  Sentry.captureRequestError(err, request, context);
};
