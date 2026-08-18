import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { getDb } from "@/server/db";
import {
  faqItems,
  legalPages,
  pricingPlans,
  processSteps,
  projects,
  sections,
  services,
  siteSettings,
} from "../../../drizzle/schema";

export type Locale = "fr" | "nl" | "en";

/**
 * Public content reads (SLV-092). Each is cached and tagged by entity so an
 * admin publish can `revalidateTag('content:<entity>')` precisely — no global
 * revalidatePath. Only published, non-deleted rows are returned (matches RLS).
 */
export function getSiteSettings() {
  return unstable_cache(
    async () => {
      const db = getDb();
      const rows = await db.select().from(siteSettings).limit(1);
      return rows[0] ?? null;
    },
    ["site-settings"],
    { tags: ["content:settings"] },
  )();
}

export function getSections(locale: Locale = "fr") {
  return unstable_cache(
    async () => {
      const db = getDb();
      return db
        .select()
        .from(sections)
        .where(and(eq(sections.status, "published"), eq(sections.locale, locale), isNull(sections.deletedAt)))
        .orderBy(asc(sections.sortOrder));
    },
    ["sections", locale],
    { tags: ["content:sections"] },
  )();
}

export async function getSectionsMap(locale: Locale = "fr") {
  const rows = await getSections(locale);
  return Object.fromEntries(rows.map((s) => [s.key, s]));
}

export function getServices(locale: Locale = "fr") {
  return unstable_cache(
    async () => {
      const db = getDb();
      return db
        .select()
        .from(services)
        .where(and(eq(services.status, "published"), eq(services.locale, locale), isNull(services.deletedAt)))
        .orderBy(asc(services.sortOrder));
    },
    ["services", locale],
    { tags: ["content:services"] },
  )();
}

export function getProcessSteps(locale: Locale = "fr") {
  return unstable_cache(
    async () => {
      const db = getDb();
      return db
        .select()
        .from(processSteps)
        .where(and(eq(processSteps.status, "published"), eq(processSteps.locale, locale), isNull(processSteps.deletedAt)))
        .orderBy(asc(processSteps.sortOrder));
    },
    ["process-steps", locale],
    { tags: ["content:process_steps"] },
  )();
}

export function getProjects(locale: Locale = "fr") {
  return unstable_cache(
    async () => {
      const db = getDb();
      return db
        .select()
        .from(projects)
        .where(and(eq(projects.status, "published"), eq(projects.locale, locale), isNull(projects.deletedAt)))
        .orderBy(asc(projects.sortOrder));
    },
    ["projects", locale],
    { tags: ["content:projects"] },
  )();
}

export function getPricingPlans(locale: Locale = "fr") {
  return unstable_cache(
    async () => {
      const db = getDb();
      return db
        .select()
        .from(pricingPlans)
        .where(and(eq(pricingPlans.status, "published"), eq(pricingPlans.locale, locale), isNull(pricingPlans.deletedAt)))
        .orderBy(asc(pricingPlans.sortOrder));
    },
    ["pricing-plans", locale],
    { tags: ["content:pricing_plans"] },
  )();
}

export function getProjectBySlug(slug: string, locale: Locale = "fr") {
  return unstable_cache(
    async () => {
      const db = getDb();
      const rows = await db
        .select()
        .from(projects)
        .where(
          and(
            eq(projects.slug, slug),
            eq(projects.locale, locale),
            eq(projects.status, "published"),
            isNull(projects.deletedAt),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    },
    ["project", slug, locale],
    { tags: ["content:projects"] },
  )();
}

export function getLegalPage(slug: string, locale: Locale = "fr") {
  return unstable_cache(
    async () => {
      const db = getDb();
      const rows = await db
        .select()
        .from(legalPages)
        .where(
          and(
            eq(legalPages.slug, slug),
            eq(legalPages.locale, locale),
            isNull(legalPages.deletedAt),
          ),
        )
        .limit(1);
      return rows[0] ?? null;
    },
    ["legal", slug, locale],
    { tags: ["content:legal_pages"] },
  )();
}

export function getFaqItems(locale: Locale = "fr") {
  return unstable_cache(
    async () => {
      const db = getDb();
      return db
        .select()
        .from(faqItems)
        .where(and(eq(faqItems.status, "published"), eq(faqItems.locale, locale), isNull(faqItems.deletedAt)))
        .orderBy(asc(faqItems.sortOrder));
    },
    ["faq-items", locale],
    { tags: ["content:faq_items"] },
  )();
}
