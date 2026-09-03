import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    globals: false,
    testTimeout: 30_000,
    include: [
      "tests/unit/**/*.test.{ts,tsx}",
      "tests/integration/**/*.test.{ts,tsx}",
    ],
    // Eager env validation runs at import; give tests a valid baseline.
    env: {
      NODE_ENV: "test",
      NEXT_PUBLIC_SITE_URL: "https://solive.test",
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      // SLV-007: ≥80% lines & branches on lib, server, api.
      include: ["src/lib/**", "src/server/**", "src/app/api/**"],
      // Infra/type-only modules: exercised by integration/e2e tests (real
      // Supabase I/O), or carry no runtime. Excluded so the unit-coverage gate
      // stays meaningful for pure logic.
      exclude: [
        "src/server/db/**",
        "src/server/actions/**",
        "src/server/queries/**",
        "src/lib/offline/**",
        "src/lib/supabase/**",
        "**/supabase-*.ts",
        "src/server/auth/guards.ts",
        "src/server/services/audit.ts",
        "src/server/services/login-attempts.ts",
        "src/server/services/sessions.ts",
        "src/server/services/rate-limit.ts",
        "src/server/services/leads-intake.ts",
        "src/server/services/email/index.ts",
        "src/app/api/**",
        "**/*.types.ts",
        // Thin wrappers around Next's request context (headers()/cookies()) —
        // no meaningful logic to unit test in isolation ("node" env, no
        // request). Behavior is exercised end-to-end by tests/e2e/i18n.spec.ts.
        "src/lib/i18n/locale.ts",
        "src/lib/i18n/admin-locale.ts",
        "src/lib/i18n/dictionary.ts",
        "src/lib/i18n/urls.ts",
        // Pure content data (strings + trivial template functions), not logic
        // under test — real content is asserted by tests/e2e/*.spec.ts.
        "src/lib/i18n/dictionaries/**",
        // localStorage-backed client helper — needs a real browser (jsdom
        // would only fake it); behavior covered by tests/e2e/consent.spec.ts.
        "src/lib/consent.ts",
        // OG image generation (satori/edge image response) — visual output,
        // no meaningful assertion in a unit test.
        "src/lib/og.tsx",
        // Agent IA de qualification: DB reads/writes, email sends, audit
        // logging, and model/tool wiring — same shape as
        // leads-intake.ts/server/actions/** above (real I/O, no pure logic
        // to isolate). Exercised manually via the Browser pane, not e2e (a
        // deterministic test on live LLM output would be fragile).
        "src/lib/agents/**",
        "src/lib/tools/**",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
});
