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
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
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
        "src/lib/supabase/**",
        "**/supabase-*.ts",
        "src/server/auth/guards.ts",
        "src/server/services/audit.ts",
        "src/server/services/login-attempts.ts",
        "src/server/services/sessions.ts",
        "**/*.types.ts",
      ],
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
});
