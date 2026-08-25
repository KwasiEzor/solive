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
 * support server-side prepared statements.
 *
 * Timeouts are load-bearing, not cosmetic: with no `connect_timeout` a stalled
 * TCP handshake (or a connection the pooler silently dropped) hangs the query
 * forever with no error — reproduced locally (a burst of concurrent queries
 * hung indefinitely, no exception, nothing to catch). `idle_timeout` +
 * `max_lifetime` recycle connections instead of reusing ones the pooler may
 * have reset. `max: 3` gives a little headroom under Vercel Fluid Compute
 * (which can route a few concurrent requests to the same warm instance)
 * without reopening the session-mode-style connection-count problem.
 *
 * Lazily constructed so the module is import-safe when SUPABASE_DB_URL is
 * unset (e.g. during Phase-1 builds).
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
    max: 3,
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
  });
  instance = drizzle(sql, { schema, casing: "snake_case" });
  return instance;
}

export { schema };
