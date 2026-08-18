import { z } from "zod";

/**
 * Auth input schemas (SLV-004, 040). Shared by client and server — the server
 * re-validates every input and never trusts the client (SLV-004).
 */

export const emailSchema = z
  .string()
  .trim()
  .min(1, "L’adresse e-mail est requise.")
  .email("Adresse e-mail invalide.")
  .transform((s) => s.toLowerCase());

// SLV-040: 12 characters minimum. HIBP breach check runs server-side (async),
// separately from this synchronous shape validation.
export const passwordSchema = z
  .string()
  .min(12, "Le mot de passe doit contenir au moins 12 caractères.")
  .max(200, "Mot de passe trop long.");

export const totpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Le code à usage unique comporte 6 chiffres.");

export const roleSchema = z.enum(["owner", "editor"]);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Le mot de passe est requis."),
  // Optional TOTP presented on the second step of the login flow.
  otp: totpCodeSchema.optional(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const inviteSchema = z.object({
  email: emailSchema,
  role: roleSchema,
});
export type InviteInput = z.infer<typeof inviteSchema>;

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const passwordResetSchema = z.object({
  token: z.string().min(1, "Jeton manquant."),
  password: passwordSchema,
});
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;

export const enrollVerifySchema = z.object({
  code: totpCodeSchema,
});

export const recoveryCodeSchema = z
  .string()
  .trim()
  .transform((s) => s.replace(/[\s-]/g, "").toLowerCase())
  .pipe(z.string().regex(/^[a-z0-9]{10}$/, "Code de récupération invalide."));
