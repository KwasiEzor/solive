import "server-only";
import { and, count, desc, eq, isNull } from "drizzle-orm";
import { getDb } from "@/server/db";
import {
  adminUsers,
  auditLog,
  contentRevisions,
  invitations,
  leadEvents,
  leads,
  legalPages,
  quoteItems,
  quotes,
  sections,
} from "../../../drizzle/schema";

export async function getAdminUsers() {
  const db = getDb();
  return db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
}

export async function getAdminProfile(userId: string) {
  const db = getDb();
  const rows = await db
    .select({
      email: adminUsers.email,
      fullName: adminUsers.fullName,
      role: adminUsers.role,
      mfaEnrolledAt: adminUsers.mfaEnrolledAt,
      lastSeenAt: adminUsers.lastSeenAt,
    })
    .from(adminUsers)
    .where(eq(adminUsers.id, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getLegalPageForEdit(slug: string, locale: "fr" | "nl" | "en") {
  const db = getDb();
  const rows = await db
    .select()
    .from(legalPages)
    .where(and(eq(legalPages.slug, slug), eq(legalPages.locale, locale)))
    .limit(1);
  return rows[0] ?? null;
}

export async function getPendingInvitations() {
  const db = getDb();
  return db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      expiresAt: invitations.expiresAt,
      acceptedAt: invitations.acceptedAt,
      createdAt: invitations.createdAt,
    })
    .from(invitations)
    .orderBy(desc(invitations.createdAt))
    .limit(50);
}

type LeadStatus = "new" | "contacted" | "quoted" | "won" | "lost";

export async function getDashboardStats() {
  const db = getDb();
  const [newLeads] = await db
    .select({ n: count() })
    .from(leads)
    .where(eq(leads.status, "new"));
  const [drafts] = await db
    .select({ n: count() })
    .from(sections)
    .where(eq(sections.status, "draft"));
  const [totalLeads] = await db.select({ n: count() }).from(leads);
  const [published] = await db
    .select({ n: count() })
    .from(sections)
    .where(eq(sections.status, "published"));
  const recentLeads = await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt))
    .limit(5);
  const recentChanges = await db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(8);
  return {
    newLeads: newLeads?.n ?? 0,
    drafts: drafts?.n ?? 0,
    totalLeads: totalLeads?.n ?? 0,
    publishedSections: published?.n ?? 0,
    recentLeads,
    recentChanges,
  };
}

export async function getLeads(status?: LeadStatus) {
  const db = getDb();
  return db
    .select()
    .from(leads)
    .where(status ? eq(leads.status, status) : undefined)
    .orderBy(desc(leads.createdAt));
}

export async function getLead(id: string) {
  const db = getDb();
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) return null;
  const events = await db
    .select()
    .from(leadEvents)
    .where(eq(leadEvents.leadId, id))
    .orderBy(desc(leadEvents.createdAt));
  return { lead, events };
}

export async function getAuditLog(limit = 100) {
  const db = getDb();
  return db
    .select()
    .from(auditLog)
    .orderBy(desc(auditLog.createdAt))
    .limit(limit);
}

/** Section for editing — any status, always fresh (no cache). */
export async function getSectionForEdit(
  key: string,
  locale: "fr" | "nl" | "en" = "fr",
) {
  const db = getDb();
  const rows = await db
    .select()
    .from(sections)
    .where(and(eq(sections.key, key), eq(sections.locale, locale)))
    .limit(1);
  return rows[0] ?? null;
}

export async function listSectionRevisions(sectionId: string) {
  const db = getDb();
  return db
    .select({
      id: contentRevisions.id,
      createdAt: contentRevisions.createdAt,
      authorId: contentRevisions.authorId,
    })
    .from(contentRevisions)
    .where(
      and(
        eq(contentRevisions.entityType, "section"),
        eq(contentRevisions.entityId, sectionId),
      ),
    )
    .orderBy(desc(contentRevisions.createdAt))
    .limit(30);
}

type QuoteStatus = "draft" | "sent" | "accepted" | "declined";

export async function getQuotes(status?: QuoteStatus) {
  const db = getDb();
  return db
    .select()
    .from(quotes)
    .where(
      status
        ? and(eq(quotes.status, status), isNull(quotes.deletedAt))
        : isNull(quotes.deletedAt),
    )
    .orderBy(desc(quotes.createdAt));
}

export async function getQuotesForLead(leadId: string) {
  const db = getDb();
  return db
    .select()
    .from(quotes)
    .where(and(eq(quotes.leadId, leadId), isNull(quotes.deletedAt)))
    .orderBy(desc(quotes.createdAt));
}

export async function getQuote(id: string) {
  const db = getDb();
  const [quote] = await db
    .select()
    .from(quotes)
    .where(and(eq(quotes.id, id), isNull(quotes.deletedAt)))
    .limit(1);
  if (!quote) return null;
  const items = await db
    .select()
    .from(quoteItems)
    .where(eq(quoteItems.quoteId, id))
    .orderBy(quoteItems.sortOrder);
  return { quote, items };
}

export const EDITABLE_SECTIONS = [
  ["hero", "Hero"],
  ["services", "Services"],
  ["methode", "Méthode"],
  ["travaux", "Travaux"],
  ["tarifs", "Tarifs"],
  ["faq", "FAQ"],
  ["contact", "Contact"],
] as const;
