import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb } from "@/server/db";
import { contentRevisions, sections } from "../../../drizzle/schema";

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
