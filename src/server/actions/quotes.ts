"use server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { env } from "@/lib/env";
import { computeQuoteTotals, formatQuoteNumber } from "@/lib/money";
import { err, ok, type Result } from "@/lib/result";
import { updateQuoteSchema } from "@/lib/schemas/quote";
import { requireAdmin } from "@/server/auth/guards";
import { getDb } from "@/server/db";
import { writeAudit } from "@/server/services/audit";
import {
  leadEvents,
  leads,
  quoteItems,
  quoteNumberCounters,
  quotes,
} from "../../../drizzle/schema";

const QUOTE_VALIDITY_DAYS = 30;

async function ipHash(): Promise<string> {
  return hashIp(
    clientIpFromHeaders(await headers()) ?? "unknown",
    env.IP_HASH_SALT ?? "dev-insecure-salt",
  );
}

async function loadQuote(id: string) {
  const db = getDb();
  const rows = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Create a draft quote from a lead, prefilling client info (SLV-1xx). */
export async function createQuoteFromLeadAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const leadId = String(formData.get("leadId") ?? "");
  if (!leadId) return;

  const db = getDb();
  const [lead] = await db.select().from(leads).where(eq(leads.id, leadId)).limit(1);
  if (!lead) return;

  const year = new Date().getFullYear();
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + QUOTE_VALIDITY_DAYS);

  const quoteId = await db.transaction(async (tx) => {
    // Row-lock based increment: concurrent inserts for the same year
    // serialize on the conflicting row instead of racing on a read-then-write
    // count(*)+1.
    const [counter] = await tx
      .insert(quoteNumberCounters)
      .values({ year, lastNumber: 1 })
      .onConflictDoUpdate({
        target: quoteNumberCounters.year,
        set: { lastNumber: sql`${quoteNumberCounters.lastNumber} + 1` },
      })
      .returning({ lastNumber: quoteNumberCounters.lastNumber });
    const lastNumber = counter!.lastNumber;

    const number = formatQuoteNumber(year, lastNumber);
    const [inserted] = await tx
      .insert(quotes)
      .values({
        number,
        year,
        sequenceNumber: lastNumber,
        leadId: lead.id,
        clientName: lead.name,
        clientEmail: lead.email,
        clientCompany: lead.company,
        validUntil,
      })
      .returning({ id: quotes.id });
    return inserted!.id;
  });

  await writeAudit({
    actorId: admin.userId,
    action: "create",
    entityType: "quote",
    entityId: quoteId,
    ipHash: await ipHash(),
    diff: { leadId },
  });
  revalidatePath(`/admin/demandes/${leadId}`);
  revalidatePath("/admin/devis");
  redirect(`/admin/devis/${quoteId}`);
}

export type QuoteResult = Result<
  { updatedAt: string },
  "unauthorized" | "not_found" | "not_draft" | "conflict" | "invalid"
>;

export async function updateQuoteAction(input: unknown): Promise<QuoteResult> {
  const admin = await requireAdmin();
  const parsed = updateQuoteSchema.safeParse(input);
  if (!parsed.success) return err("invalid");
  const data = parsed.data;

  const current = await loadQuote(data.id);
  if (!current) return err("not_found");
  if (current.status !== "draft") return err("not_draft");
  if (current.updatedAt.toISOString() !== data.expectedUpdatedAt) {
    return err("conflict");
  }

  const { lineTotals, subtotalCents, vatAmountCents, totalCents } = computeQuoteTotals(
    data.items,
    data.vatRate,
  );

  const db = getDb();
  const updated = await db.transaction(async (tx) => {
    await tx.delete(quoteItems).where(eq(quoteItems.quoteId, data.id));
    if (data.items.length > 0) {
      await tx.insert(quoteItems).values(
        data.items.map((it, i) => ({
          quoteId: data.id,
          description: it.description,
          quantity: String(it.quantity),
          unitPriceCents: it.unitPriceCents,
          lineTotalCents: lineTotals[i]!,
          sortOrder: i,
        })),
      );
    }
    const [row] = await tx
      .update(quotes)
      .set({
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        clientCompany: data.clientCompany ?? null,
        vatRate: data.vatRate.toFixed(2),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        notes: data.notes ?? null,
        subtotalCents,
        vatAmountCents,
        totalCents,
        updatedAt: new Date(),
      })
      .where(eq(quotes.id, data.id))
      .returning();
    return row!;
  });

  await writeAudit({
    actorId: admin.userId,
    action: "update",
    entityType: "quote",
    entityId: data.id,
    ipHash: await ipHash(),
    diff: { totalCents },
  });
  revalidatePath(`/admin/devis/${data.id}`);
  return ok({ updatedAt: updated.updatedAt.toISOString() });
}

/** Mark a quote sent; auto-advances its lead to "quoted" (mirrors updateLeadStatusAction). */
export async function markQuoteSentAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("quoteId") ?? "");
  if (!id) return;

  const quote = await loadQuote(id);
  if (!quote || quote.status !== "draft") return;

  const db = getDb();
  let previousLeadStatus: string | null = null;
  await db.transaction(async (tx) => {
    await tx
      .update(quotes)
      .set({ status: "sent", sentAt: new Date(), updatedAt: new Date() })
      .where(eq(quotes.id, id));

    if (quote.leadId) {
      const [lead] = await tx
        .select()
        .from(leads)
        .where(eq(leads.id, quote.leadId))
        .limit(1);
      if (lead) {
        previousLeadStatus = lead.status;
        await tx.update(leads).set({ status: "quoted" }).where(eq(leads.id, lead.id));
        await tx.insert(leadEvents).values({
          leadId: lead.id,
          type: "status_change",
          payload: { from: lead.status, to: "quoted" },
          actorId: admin.userId,
        });
      }
    }
  });

  const hash = await ipHash();
  await writeAudit({
    actorId: admin.userId,
    action: "update",
    entityType: "quote",
    entityId: id,
    ipHash: hash,
    diff: { status: { from: "draft", to: "sent" } },
  });
  if (quote.leadId && previousLeadStatus) {
    await writeAudit({
      actorId: admin.userId,
      action: "update",
      entityType: "lead",
      entityId: quote.leadId,
      ipHash: hash,
      diff: { status: { from: previousLeadStatus, to: "quoted" } },
    });
    revalidatePath(`/admin/demandes/${quote.leadId}`);
    revalidatePath("/admin/demandes");
  }
  revalidatePath(`/admin/devis/${id}`);
  revalidatePath("/admin/devis");
}

/** Draft-only: a sent/accepted/declined quote is a financial record, kept. */
export async function deleteQuoteAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("quoteId") ?? "");
  if (!id) return;

  const quote = await loadQuote(id);
  if (!quote || quote.status !== "draft") return;

  const db = getDb();
  await db.update(quotes).set({ deletedAt: new Date() }).where(eq(quotes.id, id));

  await writeAudit({
    actorId: admin.userId,
    action: "delete",
    entityType: "quote",
    entityId: id,
    ipHash: await ipHash(),
  });
  revalidatePath("/admin/devis");
  if (quote.leadId) revalidatePath(`/admin/demandes/${quote.leadId}`);
  redirect("/admin/devis");
}
