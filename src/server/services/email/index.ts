import { env } from "@/lib/env";
import { BrevoMailer } from "./brevo";
import type { Mailer } from "./types";

export * from "./types";

/** Returns the configured mailer, or null when email isn't set up (dev). */
export function getMailer(): Mailer | null {
  if (!env.BREVO_API_KEY || !env.EMAIL_FROM) return null;
  return new BrevoMailer(env.BREVO_API_KEY, {
    email: env.EMAIL_FROM,
    name: "Solive",
  });
}
