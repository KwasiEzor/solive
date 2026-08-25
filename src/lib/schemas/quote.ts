import { z } from "zod";
import { emailSchema } from "./auth";

export const quoteItemInputSchema = z.object({
  description: z.string().trim().min(1, "Description requise.").max(500),
  quantity: z.number().positive().max(100_000),
  unitPriceCents: z.number().int().min(0).max(100_000_000),
});

export type QuoteItemInput = z.infer<typeof quoteItemInputSchema>;

export const updateQuoteSchema = z.object({
  id: z.string().uuid(),
  clientName: z.string().trim().min(1, "Nom du client requis.").max(200),
  clientEmail: emailSchema,
  clientCompany: z.string().trim().max(200).optional(),
  vatRate: z.number().min(0).max(100),
  validUntil: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(2000).optional(),
  items: z.array(quoteItemInputSchema).min(1, "Au moins une ligne.").max(100),
  expectedUpdatedAt: z.string(),
});

export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
