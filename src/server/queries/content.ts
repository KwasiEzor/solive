import "server-only";
import { and, asc, eq, isNull } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
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
  testimonials,
} from "../../../drizzle/schema";

export type Locale = "fr" | "en";

/**
 * Public content reads (SLV-092). Cached via "use cache" + cacheTag (Cache
 * Components, replaces unstable_cache) so an admin publish invalidates
 * precisely (revalidateTag/updateTag in the Server Actions) — no global
 * revalidatePath. Only published, non-deleted rows (matches RLS).
 *
 * cacheLife("max"): matches the previous unstable_cache behavior exactly —
 * no time-based expiry, served until a tagged mutation revalidates it.
 */

export async function getSiteSettings() {
  "use cache";
  cacheLife("max");
  cacheTag("content:settings");
  const db = getDb();
  const rows = await db.select().from(siteSettings).limit(1);
  return rows[0] ?? null;
}

export async function getSections(locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:sections");
  const db = getDb();
  return db
    .select()
    .from(sections)
    .where(
      and(
        eq(sections.status, "published"),
        eq(sections.locale, locale),
        isNull(sections.deletedAt),
      ),
    )
    .orderBy(asc(sections.sortOrder));
}

export async function getSectionsMap(locale: Locale = "fr") {
  const rows = await getSections(locale);
  return Object.fromEntries(rows.map((s) => [s.key, s]));
}

export async function getServices(locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:services");
  const db = getDb();
  return db
    .select()
    .from(services)
    .where(
      and(
        eq(services.status, "published"),
        eq(services.locale, locale),
        isNull(services.deletedAt),
      ),
    )
    .orderBy(asc(services.sortOrder));
}

export async function getProcessSteps(locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:process_steps");
  const db = getDb();
  return db
    .select()
    .from(processSteps)
    .where(
      and(
        eq(processSteps.status, "published"),
        eq(processSteps.locale, locale),
        isNull(processSteps.deletedAt),
      ),
    )
    .orderBy(asc(processSteps.sortOrder));
}

export async function getProjects(locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:projects");
  const db = getDb();
  return db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.status, "published"),
        eq(projects.locale, locale),
        isNull(projects.deletedAt),
      ),
    )
    .orderBy(asc(projects.sortOrder));
}

export async function getProjectBySlug(slug: string, locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:projects");
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
}

export async function getPricingPlans(locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:pricing_plans");
  const db = getDb();
  return db
    .select()
    .from(pricingPlans)
    .where(
      and(
        eq(pricingPlans.status, "published"),
        eq(pricingPlans.locale, locale),
        isNull(pricingPlans.deletedAt),
      ),
    )
    .orderBy(asc(pricingPlans.sortOrder));
}

export async function getTestimonials(locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:testimonials");
  const db = getDb();
  return db
    .select()
    .from(testimonials)
    .where(
      and(
        eq(testimonials.status, "published"),
        eq(testimonials.locale, locale),
        isNull(testimonials.deletedAt),
      ),
    )
    .orderBy(asc(testimonials.sortOrder));
}

export async function getFaqItems(locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:faq_items");
  const db = getDb();
  return db
    .select()
    .from(faqItems)
    .where(
      and(
        eq(faqItems.status, "published"),
        eq(faqItems.locale, locale),
        isNull(faqItems.deletedAt),
      ),
    )
    .orderBy(asc(faqItems.sortOrder));
}

export async function getLegalPage(slug: string, locale: Locale = "fr") {
  "use cache";
  cacheLife("max");
  cacheTag("content:legal_pages");
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
}
