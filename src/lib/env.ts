import { z } from "zod";

/**
 * Environment validation (SLV-057).
 * Secrets live only in env vars. A missing/invalid required var throws at
 * module load, which fails `next build` before anything ships. Add each
 * integration's vars to the schema in the phase that wires it.
 *
 * NEXT_PUBLIC_* are the only vars allowed to reach the client bundle.
 * The service_role key (SLV-003) must never be marked NEXT_PUBLIC_.
 */

const url = z.string().url();

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  // Public site origin — required from Phase 1 (canonical URLs, emails, SW).
  NEXT_PUBLIC_SITE_URL: url,

  // --- Wired in later phases; optional until then (documented per SLV-057). ---
  // Phase 2 (data): Supabase + Drizzle
  SUPABASE_DB_URL: z.string().min(1).optional(),
  NEXT_PUBLIC_SUPABASE_URL: url.optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  // Phase 5 (media): Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().min(1).optional(),
  CLOUDINARY_API_KEY: z.string().min(1).optional(),
  CLOUDINARY_API_SECRET: z.string().min(1).optional(),
  // Phase 3 (auth/security): salt for IP/email hashing (SLV-125)
  IP_HASH_SALT: z.string().min(16).optional(),
  // Phase 6 (form + email): Brevo (transactional), Turnstile (anti-spam),
  // Upstash Redis (rate limiting — provisioned by Vercel with KV_* names).
  BREVO_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().email().optional(),
  EMAIL_TO: z.string().email().optional(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
  TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
  KV_REST_API_URL: url.optional(),
  KV_REST_API_TOKEN: z.string().min(1).optional(),
  // Phase 9 (observability): Sentry
  NEXT_PUBLIC_SENTRY_DSN: z.string().min(1).optional(),
  // Booking (Cal.com). The public booking URL itself lives in src/lib/cal.ts
  // (not a secret) — this key is reserved for a future server-side use
  // (e.g. a webhook syncing completed bookings into `leads`), unused by the
  // plain iframe embed itself.
  CAL_API_KEY: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class EnvValidationError extends Error {
  constructor(issues: string[]) {
    super(`Invalid environment configuration:\n${issues.join("\n")}`);
    this.name = "EnvValidationError";
  }
}

/** Pure, testable parse — used at load with process.env. */
export function parseEnv(source: Record<string, string | undefined>): ServerEnv {
  // Treat empty strings (blank .env placeholders) as unset.
  const cleaned = Object.fromEntries(
    Object.entries(source).map(([k, v]) => [k, v === "" ? undefined : v]),
  );
  const result = serverEnvSchema.safeParse(cleaned);
  if (!result.success) {
    const issues = result.error.issues.map(
      (i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`,
    );
    throw new EnvValidationError(issues);
  }
  return result.data;
}

export const env: ServerEnv = parseEnv(process.env);
