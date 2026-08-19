import "server-only";
import { and, count, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import {
  auditLog,
  contentRevisions,
  leadEvents,
  leads,
  sections,
} from "../../../drizzle/schema";

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

export const EDITABLE_SECTIONS = [
  ["hero", "Hero"],
  ["services", "Services"],
  ["methode", "Méthode"],
  ["travaux", "Travaux"],
  ["tarifs", "Tarifs"],
  ["faq", "FAQ"],
  ["contact", "Contact"],
] as const;
