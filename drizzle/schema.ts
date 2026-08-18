/**
 * Solive database schema (Drizzle) — SLV-010 → SLV-031.
 * Conventions: snake_case in DB, camelCase in TS, uuid v7 PKs, created_at /
 * updated_at everywhere, logical delete (deleted_at) on content tables.
 *
 * RLS policies, the uuid_generate_v7() function, updated_at triggers and the
 * audit_log immutability rules live in the versioned SQL migrations under
 * drizzle/migrations/ (Drizzle's generator does not cover them). This file is
 * the source of truth for table shapes and app-side typing/queries.
 */
import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgSchema,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ── Supabase auth.users (external; referenced only) ────────────────── */
const authSchema = pgSchema("auth");
export const authUsers = authSchema.table("users", {
  id: uuid("id").primaryKey(),
});

/* ── Enums ──────────────────────────────────────────────────────────── */
export const userRole = pgEnum("user_role", ["owner", "editor"]);
export const publicationStatus = pgEnum("publication_status", [
  "draft",
  "published",
]);
export const locale = pgEnum("locale", ["fr", "nl", "en"]);
export const palette = pgEnum("palette", ["chaux", "ardoise", "cobalt"]);
export const auditAction = pgEnum("audit_action", [
  "create",
  "update",
  "delete",
  "publish",
  "unpublish",
  "restore",
  "login",
  "invite",
  "role_change",
  "reorder",
]);
export const leadSource = pgEnum("lead_source", ["web", "offline_sync"]);
export const leadStatus = pgEnum("lead_status", [
  "new",
  "contacted",
  "quoted",
  "won",
  "lost",
]);
export const leadEventType = pgEnum("lead_event_type", [
  "status_change",
  "email_sent",
  "note",
]);
export const translationStatus = pgEnum("translation_status", [
  "to_translate",
  "up_to_date",
  "outdated",
]);

/* ── Shared column groups ───────────────────────────────────────────── */
const pk = {
  id: uuid("id")
    .primaryKey()
    .default(sql`uuid_generate_v7()`),
};
const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
};
const softDelete = {
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
};

/* ═══ 4.1 Auth & roles ══════════════════════════════════════════════ */

// SLV-010
export const adminUsers = pgTable("admin_users", {
  id: uuid("id")
    .primaryKey()
    .references(() => authUsers.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: userRole("role").notNull().default("editor"),
  mfaEnrolledAt: timestamp("mfa_enrolled_at", { withTimezone: true }),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
  disabledAt: timestamp("disabled_at", { withTimezone: true }),
  ...timestamps,
});

// SLV-011
export const invitations = pgTable(
  "invitations",
  {
    ...pk,
    email: text("email").notNull(),
    role: userRole("role").notNull().default("editor"),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    invitedBy: uuid("invited_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("invitations_token_hash_idx").on(t.tokenHash),
    index("invitations_email_idx").on(t.email),
  ],
);

// SLV-012 — insert-only (no UPDATE/DELETE, enforced by RLS + triggers)
export const auditLog = pgTable(
  "audit_log",
  {
    ...pk,
    actorId: uuid("actor_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    action: auditAction("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    diff: jsonb("diff"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("audit_log_actor_idx").on(t.actorId),
    index("audit_log_created_idx").on(t.createdAt),
    index("audit_log_entity_idx").on(t.entityType, t.entityId),
  ],
);

// SLV-013 — purged at 30 days
export const loginAttempts = pgTable(
  "login_attempts",
  {
    ...pk,
    emailHash: text("email_hash").notNull(),
    ipHash: text("ip_hash").notNull(),
    succeeded: boolean("succeeded").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("login_attempts_email_idx").on(t.emailHash, t.createdAt),
    index("login_attempts_ip_idx").on(t.ipHash, t.createdAt),
  ],
);

/* ═══ 4.2 Content ═══════════════════════════════════════════════════ */

// SLV-020 — singleton
export const siteSettings = pgTable("site_settings", {
  ...pk,
  name: text("name").notNull().default("Solive"),
  baseline: text("baseline"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  vat: text("vat"),
  socials: jsonb("socials").$type<Record<string, string>>().default({}),
  activePalette: palette("active_palette").notNull().default("chaux"),
  enabledLocales: jsonb("enabled_locales")
    .$type<Array<"fr" | "nl" | "en">>()
    .notNull()
    .default(["fr"]),
  // Enforce single row via a constant unique column (see migration).
  singleton: boolean("singleton").notNull().default(true),
  ...timestamps,
});

// SLV-021
export const sections = pgTable(
  "sections",
  {
    ...pk,
    key: text("key").notNull(),
    locale: locale("locale").notNull().default("fr"),
    heading: text("heading"),
    kicker: text("kicker"),
    body: jsonb("body"),
    sortOrder: integer("sort_order").notNull().default(0),
    isVisible: boolean("is_visible").notNull().default(true),
    status: publicationStatus("status").notNull().default("draft"),
    translationStatus: translationStatus("translation_status")
      .notNull()
      .default("up_to_date"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("sections_key_locale_idx").on(t.key, t.locale),
    index("sections_status_idx").on(t.status, t.locale),
  ],
);

// SLV-022
export const services = pgTable(
  "services",
  {
    ...pk,
    lotLabel: text("lot_label"),
    title: text("title").notNull(),
    summary: text("summary"),
    bullets: jsonb("bullets").$type<string[]>().notNull().default([]),
    iconKey: text("icon_key"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("draft"),
    locale: locale("locale").notNull().default("fr"),
    translationStatus: translationStatus("translation_status")
      .notNull()
      .default("up_to_date"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("services_status_idx").on(t.status, t.locale, t.sortOrder)],
);

// SLV-023
export const processSteps = pgTable(
  "process_steps",
  {
    ...pk,
    number: text("number").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    duration: text("duration"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("draft"),
    locale: locale("locale").notNull().default("fr"),
    translationStatus: translationStatus("translation_status")
      .notNull()
      .default("up_to_date"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("process_steps_status_idx").on(t.status, t.locale, t.sortOrder)],
);

// SLV-027 — media (declared before projects for FK)
export const media = pgTable(
  "media",
  {
    ...pk,
    cloudinaryPublicId: text("cloudinary_public_id").notNull(),
    format: text("format"),
    width: integer("width"),
    height: integer("height"),
    bytes: integer("bytes"),
    // Alt text mandatory — SLV-027: a media without alternative text is refused.
    altText: text("alt_text").notNull(),
    caption: text("caption"),
    blurDataUrl: text("blur_data_url"),
    uploadedBy: uuid("uploaded_by").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [uniqueIndex("media_public_id_idx").on(t.cloudinaryPublicId)],
);

// SLV-024
export const projects = pgTable(
  "projects",
  {
    ...pk,
    slug: text("slug").notNull(),
    sector: text("sector"),
    title: text("title").notNull(),
    metricValue: text("metric_value"),
    metricLabel: text("metric_label"),
    stack: jsonb("stack").$type<string[]>().notNull().default([]),
    body: jsonb("body"),
    coverMediaId: uuid("cover_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
    clientName: text("client_name"),
    isFeatured: boolean("is_featured").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    locale: locale("locale").notNull().default("fr"),
    translationStatus: translationStatus("translation_status")
      .notNull()
      .default("up_to_date"),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    ogMediaId: uuid("og_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("projects_slug_locale_idx").on(t.slug, t.locale),
    index("projects_status_idx").on(t.status, t.locale, t.sortOrder),
    index("projects_featured_idx").on(t.isFeatured),
  ],
);

// SLV-025
export const pricingPlans = pgTable(
  "pricing_plans",
  {
    ...pk,
    name: text("name").notNull(),
    priceLabel: text("price_label"),
    priceNote: text("price_note"),
    includes: jsonb("includes").$type<string[]>().notNull().default([]),
    isHighlighted: boolean("is_highlighted").notNull().default(false),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("draft"),
    locale: locale("locale").notNull().default("fr"),
    translationStatus: translationStatus("translation_status")
      .notNull()
      .default("up_to_date"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("pricing_plans_status_idx").on(t.status, t.locale, t.sortOrder)],
);

// SLV-026
export const faqItems = pgTable(
  "faq_items",
  {
    ...pk,
    question: text("question").notNull(),
    answer: jsonb("answer"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: publicationStatus("status").notNull().default("draft"),
    locale: locale("locale").notNull().default("fr"),
    translationStatus: translationStatus("translation_status")
      .notNull()
      .default("up_to_date"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [index("faq_items_status_idx").on(t.status, t.locale, t.sortOrder)],
);

// SLV-028 — keep last 30 revisions per entity (pruned)
export const contentRevisions = pgTable(
  "content_revisions",
  {
    ...pk,
    entityType: text("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    snapshot: jsonb("snapshot").notNull(),
    authorId: uuid("author_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("content_revisions_entity_idx").on(
      t.entityType,
      t.entityId,
      t.createdAt,
    ),
  ],
);

// SLV-029
export const legalPages = pgTable(
  "legal_pages",
  {
    ...pk,
    slug: text("slug").notNull(),
    title: text("title"),
    body: jsonb("body"),
    locale: locale("locale").notNull().default("fr"),
    ...timestamps,
    ...softDelete,
  },
  (t) => [uniqueIndex("legal_pages_slug_locale_idx").on(t.slug, t.locale)],
);

/* ═══ 4.3 Leads ═════════════════════════════════════════════════════ */

// SLV-030
export const leads = pgTable(
  "leads",
  {
    ...pk,
    // client-generated UUID for idempotent offline replays (SLV-084)
    clientId: uuid("client_id").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    company: text("company"),
    projectTypes: jsonb("project_types").$type<string[]>().notNull().default([]),
    message: text("message").notNull(),
    budgetRange: text("budget_range"),
    locale: locale("locale").notNull().default("fr"),
    source: leadSource("source").notNull().default("web"),
    status: leadStatus("status").notNull().default("new"),
    internalNotes: text("internal_notes"),
    ipHash: text("ip_hash"),
    userAgent: text("user_agent"),
    turnstileOk: boolean("turnstile_ok").notNull().default(false),
    spamScore: integer("spam_score"),
    // browser-local timestamp, distinct from created_at (offline sends)
    clientSubmittedAt: timestamp("client_submitted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("leads_client_id_idx").on(t.clientId),
    index("leads_status_idx").on(t.status, t.createdAt),
    index("leads_created_idx").on(t.createdAt),
  ],
);

// SLV-031
export const leadEvents = pgTable(
  "lead_events",
  {
    ...pk,
    leadId: uuid("lead_id")
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    type: leadEventType("type").notNull(),
    payload: jsonb("payload"),
    actorId: uuid("actor_id").references(() => adminUsers.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("lead_events_lead_idx").on(t.leadId, t.createdAt)],
);
