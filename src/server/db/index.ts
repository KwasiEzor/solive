import "server-only";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/lib/env";
import * as schema from "../../../drizzle/schema";

/**
 * Server-side Drizzle client (SLV, §1 ORM). Uses postgres-js against the
 * Supabase pooled connection. `prepare: false` for pgbouncer transaction mode.
 * Lazily constructed so the module is import-safe when SUPABASE_DB_URL is unset
 * (e.g. during Phase-1 builds).
 */
let instance: PostgresJsDatabase<typeof schema> | null = null;

export function getDb(): PostgresJsDatabase<typeof schema> {
  if (instance) return instance;
  if (!env.SUPABASE_DB_URL) {
    throw new Error("SUPABASE_DB_URL is required to reach the database.");
  }
  const sql = postgres(env.SUPABASE_DB_URL, { prepare: false, ssl: "require" });
  instance = drizzle(sql, { schema, casing: "snake_case" });
  return instance;
}

export { schema };
