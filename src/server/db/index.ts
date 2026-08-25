import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "../../../drizzle/schema";

/**
 * Server-side Drizzle client (SLV, §1 ORM). Uses postgres-js against the
 * Supabase Supavisor pooler in **transaction mode (port 6543)** — required for
 * serverless: session mode (port 5432) caps the whole project at ~15 total
 * connections, which a handful of concurrent Vercel function instances can
 * exhaust on their own (observed in production: "max clients reached in
 * session mode"). `prepare: false` because pgbouncer transaction mode doesn't
 * support server-side prepared statements. `max: 1` keeps each function
 * instance's own footprint minimal — the pooler is what fans this out.
 * Lazily constructed so the module is import-safe when SUPABASE_DB_URL is unset
 * (e.g. during Phase-1 builds).
 */
let instance: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (instance) return instance;
  if (!env.SUPABASE_DB_URL) {
    throw new Error("SUPABASE_DB_URL is required to reach the database.");
  }
  const sql = postgres(env.SUPABASE_DB_URL, {
    prepare: false,
    ssl: "require",
    max: 1,
  });
  instance = drizzle(sql, { schema, casing: "snake_case" });
  return instance;
}

export { schema };
