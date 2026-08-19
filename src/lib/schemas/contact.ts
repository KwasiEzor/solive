import { z } from "zod";
import { emailSchema } from "./auth";

/**
 * Contact submission (SLV-030, 055). Shared client/server. Includes anti-spam
 * fields the server enforces: honeypot (must stay empty), elapsed time (reject
 * < 2 s), and the Turnstile token (verified server-side).
 */
export const PROJECT_TYPES = [
  "Site vitrine",
  "Refonte",
  "Application web",
  "Application mobile",
  "Je ne sais pas encore",
] as const;

export const MIN_ELAPSED_MS = 2000;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Votre nom est requis.").max(120),
  email: emailSchema,
  company: z.string().trim().max(160).optional(),
  projectTypes: z.array(z.string().max(60)).max(10).default([]),
  message: z
    .string()
    .trim()
    .min(10, "Décrivez le projet en une phrase ou deux.")
    .max(5000),
  budgetRange: z.string().max(60).optional(),
  locale: z.enum(["fr", "nl", "en"]).default("fr"),
  // Client-generated UUID for idempotent offline replays (SLV-084).
  clientId: z.string().uuid("Identifiant client invalide."),
  clientSubmittedAt: z.string().datetime().optional(),
  turnstileToken: z.string().min(1, "Vérification anti-spam manquante."),
  // Honeypot: real users never fill this; bots often do (SLV-055).
  website: z.string().max(0, "invalid").optional().default(""),
  // Time from form render to submit; the server rejects sub-2s submits.
  elapsedMs: z.number().int().nonnegative().optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** True when the submission timing looks human (SLV-055). */
export function isHumanTiming(elapsedMs: number | undefined): boolean {
  return elapsedMs === undefined || elapsedMs >= MIN_ELAPSED_MS;
}
