import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";
// Validate environment at build/boot: a missing required var throws here and
// fails the build before anything ships (SLV-057).
import "./src/lib/env";

const nextConfig: NextConfig = {
  // Cache Components (Next 16): "use cache"/cacheLife/cacheTag replace
  // unstable_cache in src/server/queries/content.ts. Does NOT make this app's
  // pages statically shell-able — the root layout's per-request CSP nonce
  // (headers(), SLV-051) sits above every route and can't be wrapped in
  // <Suspense> (it drives <html lang>, per Next's own guidance on this exact
  // pattern), so every page stays fully dynamic by deliberate design. The
  // instant-navigation validation this flag enables is dev-only (warning
  // level, doesn't affect `next build`) — the dev overlay will flag this
  // app's routes as non-instant, which is expected: pursuing a static shell
  // here would mean dropping the per-request nonce CSP model, a separate,
  // bigger decision this repo isn't making right now.
  cacheComponents: true,
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
