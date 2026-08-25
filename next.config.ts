import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";
// Validate environment at build/boot: a missing required var throws here and
// fails the build before anything ships (SLV-057).
import "./src/lib/env";

const nextConfig: NextConfig = {
  // pdfkit (via @react-pdf/renderer) loads its standard font metrics from
  // disk at runtime with a dynamic require Next's tracer can't follow — the
  // serverless bundle silently drops them without this (MODULE_NOT_FOUND on
  // Helvetica.cjs in production).
  outputFileTracingIncludes: {
    "/api/admin/devis/\\[id\\]/pdf": ["./node_modules/pdfkit/**/*"],
  },
};

// PWA / offline (SLV-080-088). SW disabled in dev to avoid caching churn.
const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Don't force a reload on reconnect — it would interrupt the queued-send flow.
  reloadOnOnline: false,
});

export default withSerwist(nextConfig);
