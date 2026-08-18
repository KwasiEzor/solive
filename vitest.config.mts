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
      // Infra/type-only modules: exercised by integration (RLS) tests, or
      // carry no runtime. Excluded so the unit-coverage gate stays meaningful.
      exclude: ["src/server/db/**", "**/*.types.ts"],
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
});
