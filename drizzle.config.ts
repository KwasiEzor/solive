import { defineConfig } from "drizzle-kit";

// Migrations are authored as versioned SQL in drizzle/migrations/ and applied
// to Supabase (they include RLS, functions and triggers Drizzle can't emit).
// This config drives `drizzle-kit` for introspection/typing and future pushes.
export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.SUPABASE_DB_URL ?? "",
  },
  casing: "snake_case",
  schemaFilter: ["public"],
  verbose: true,
  strict: true,
});
