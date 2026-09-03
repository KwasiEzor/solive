import "server-only";
import { and, count, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { getDb } from "@/server/db";
import {
  adminUsers,
  agentSettings,
  auditLog,
  contentRevisions,
  invitations,
  leadEvents,
  leads,
  legalPages,
  pageViews,
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

export async function getLegalPageForEdit(slug: string, locale: "fr" | "en") {
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

const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "quoted", "won", "lost"];

/**
 * Conversion funnel for the dashboard (page views → leads → quotes → signed
 * revenue), separate from getDashboardStats so that function's existing
 * shape/callers stay untouched. Rates over a rolling 30-day window; the
 * lead-status breakdown is the full current pipeline (not windowed) — more
 * useful as "where things stand" than "what changed recently".
 */
export async function getFunnelStats() {
  const db = getDb();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [views] = await db
    .select({ n: count() })
    .from(pageViews)
    .where(gte(pageViews.createdAt, since));
  const [newLeadsCount] = await db
    .select({ n: count() })
    .from(leads)
    .where(gte(leads.createdAt, since));
  const [quotesCreated] = await db
    .select({ n: count() })
    .from(quotes)
    .where(and(gte(quotes.createdAt, since), isNull(quotes.deletedAt)));
  const [quotesSent] = await db
    .select({ n: count() })
    .from(quotes)
    .where(
      and(
        gte(quotes.createdAt, since),
        isNull(quotes.deletedAt),
        sql`${quotes.status} in ('sent', 'accepted', 'declined')`,
      ),
    );
  const [accepted] = await db
    .select({
      n: count(),
      revenueCents: sql<number>`coalesce(sum(${quotes.totalCents}), 0)`.mapWith(Number),
    })
    .from(quotes)
    .where(
      and(
        gte(quotes.createdAt, since),
        isNull(quotes.deletedAt),
        eq(quotes.status, "accepted"),
      ),
    );

  const byStatusRows = await db
    .select({ status: leads.status, n: count() })
    .from(leads)
    .groupBy(leads.status);
  const byStatus = Object.fromEntries(
    LEAD_STATUSES.map((s) => [s, byStatusRows.find((r) => r.status === s)?.n ?? 0]),
  ) as Record<LeadStatus, number>;

  const pageViewsCount = views?.n ?? 0;
  const leadsCount = newLeadsCount?.n ?? 0;
  const quotesCreatedCount = quotesCreated?.n ?? 0;

  return {
    since,
    pageViews: pageViewsCount,
    leads: leadsCount,
    viewToLeadRate: pageViewsCount > 0 ? leadsCount / pageViewsCount : 0,
    quotesCreated: quotesCreatedCount,
    leadToQuoteRate: leadsCount > 0 ? quotesCreatedCount / leadsCount : 0,
    quotesSent: quotesSent?.n ?? 0,
    quotesAccepted: accepted?.n ?? 0,
    sentToAcceptedRate:
      (quotesSent?.n ?? 0) > 0 ? (accepted?.n ?? 0) / (quotesSent?.n ?? 0) : 0,
    revenueAcceptedCents: accepted?.revenueCents ?? 0,
    leadsByStatus: byStatus,
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
  locale: "fr" | "en" = "fr",
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

/**
 * Masked read for /admin/agent-ia — never decrypts (src/server/services/
 * agent-settings.ts owns that, only for the chat route). *_last4 are the
 * only credential-derived fields exposed to the admin UI.
 */
export async function getAgentSettingsForAdmin() {
  const db = getDb();
  const [row] = await db.select().from(agentSettings).limit(1);
  if (!row) return null;
  return {
    enabled: row.enabled,
    model: row.model,
    instructionsFr: row.instructionsFr,
    instructionsEn: row.instructionsEn,
    hasApiKey: Boolean(row.anthropicApiKeyEnc),
    apiKeyLast4: row.anthropicApiKeyLast4,
    hasWorkspaceId: Boolean(row.anthropicWorkspaceIdEnc),
    workspaceIdLast4: row.anthropicWorkspaceIdLast4,
    updatedAt: row.updatedAt,
  };
}
