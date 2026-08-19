import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { leadEvents, leads } from "../../../drizzle/schema";

export interface LeadIntakeInput {
  clientId: string;
  name: string;
  email: string;
  company?: string | null;
  projectTypes: string[];
  message: string;
  budgetRange?: string | null;
  locale: "fr" | "nl" | "en";
  source: "web" | "offline_sync";
  ipHash: string | null;
  userAgent: string | null;
  turnstileOk: boolean;
  spamScore: number;
  clientSubmittedAt?: string;
}

/**
 * Insert a lead, idempotent on client_id (SLV-084): a replay never creates a
 * second lead. Returns whether this call created it (so emails/audit fire once).
 */
export async function createLeadIdempotent(
  input: LeadIntakeInput,
): Promise<{ id: string; created: boolean }> {
  const db = getDb();
  const inserted = await db
    .insert(leads)
    .values({
      clientId: input.clientId,
      name: input.name,
      email: input.email,
      company: input.company ?? null,
      projectTypes: input.projectTypes,
      message: input.message,
      budgetRange: input.budgetRange ?? null,
      locale: input.locale,
      source: input.source,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
      turnstileOk: input.turnstileOk,
      spamScore: input.spamScore,
      clientSubmittedAt: input.clientSubmittedAt
        ? new Date(input.clientSubmittedAt)
        : null,
    })
    .onConflictDoNothing({ target: leads.clientId })
    .returning({ id: leads.id });

  const row = inserted[0];
  if (row) {
    await db.insert(leadEvents).values({
      leadId: row.id,
      type: "status_change",
      payload: { to: "new" },
      actorId: null,
    });
    return { id: row.id, created: true };
  }

  const [existing] = await db
    .select({ id: leads.id })
    .from(leads)
    .where(eq(leads.clientId, input.clientId))
    .limit(1);
  return { id: existing!.id, created: false };
}
