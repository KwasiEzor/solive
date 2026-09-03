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
  numeric,
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

// SLV-042 — hashed single-use MFA recovery codes
export const mfaRecoveryCodes = pgTable(
  "mfa_recovery_codes",
  {
    ...pk,
    userId: uuid("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    codeHash: text("code_hash").notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("mfa_recovery_codes_user_idx").on(t.userId)],
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
  showFloatCta: boolean("show_float_cta").notNull().default(true),
  showThemeSwitcher: boolean("show_theme_switcher").notNull().default(true),
  // Enforce single row via a constant unique column (see migration).
  singleton: boolean("singleton").notNull().default(true),
  ...timestamps,
});

// Agent IA de qualification — config editable from /admin/agent-ia without a
// redeploy. Singleton row, same shape/convention as site_settings above.
// anthropic*Enc columns hold AES-256-GCM blobs (src/server/services/secrets.ts),
// never plaintext; *_last4 are plaintext solely for admin display ("does this
// look like the right key"), never enough to reconstruct the secret.
export const agentSettings = pgTable("agent_settings", {
  ...pk,
  enabled: boolean("enabled").notNull().default(true),
  model: text("model").notNull().default("claude-haiku-4-5"),
  instructionsFr: text("instructions_fr"),
  instructionsEn: text("instructions_en"),
  anthropicApiKeyEnc: text("anthropic_api_key_enc"),
  anthropicApiKeyLast4: text("anthropic_api_key_last4"),
  anthropicWorkspaceIdEnc: text("anthropic_workspace_id_enc"),
  anthropicWorkspaceIdLast4: text("anthropic_workspace_id_last4"),
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

// SLV-027b — client testimonials (social proof)
export const testimonials = pgTable(
  "testimonials",
  {
    ...pk,
    author: text("author").notNull(),
    role: text("role"),
    company: text("company"),
    sector: text("sector"),
    quote: text("quote").notNull(),
    rating: integer("rating"),
    projectSlug: text("project_slug"),
    avatarMediaId: uuid("avatar_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    isFeatured: boolean("is_featured").notNull().default(false),
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
  (t) => [index("testimonials_status_idx").on(t.status, t.locale, t.sortOrder)],
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

/* ═══ 4.4 Quotes ════════════════════════════════════════════════════ */

export const quoteStatus = pgEnum("quote_status", [
  "draft",
  "sent",
  "accepted",
  "declined",
]);

// Per-year atomic counter backing the human-readable quote number
// (DEV-2026-0001) — a dedicated table rather than a bare sequence because the
// format resets to 0001 every new year.
export const quoteNumberCounters = pgTable("quote_number_counters", {
  year: integer("year").primaryKey(),
  lastNumber: integer("last_number").notNull().default(0),
});

export const quotes = pgTable(
  "quotes",
  {
    ...pk,
    number: text("number").notNull(),
    year: integer("year").notNull(),
    sequenceNumber: integer("sequence_number").notNull(),
    leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
    // Snapshot at creation time: a quote is quasi-legal and must not silently
    // change if the source lead's name/email is edited afterwards.
    clientName: text("client_name").notNull(),
    clientEmail: text("client_email").notNull(),
    clientCompany: text("client_company"),
    status: quoteStatus("status").notNull().default("draft"),
    vatRate: numeric("vat_rate", { precision: 5, scale: 2 })
      .notNull()
      .default("21.00"),
    subtotalCents: integer("subtotal_cents").notNull().default(0),
    vatAmountCents: integer("vat_amount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull().default(0),
    validUntil: timestamp("valid_until", { withTimezone: true }),
    notes: text("notes"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    ...timestamps,
    ...softDelete,
  },
  (t) => [
    uniqueIndex("quotes_number_idx").on(t.number),
    index("quotes_lead_idx").on(t.leadId),
    index("quotes_status_idx").on(t.status, t.createdAt),
  ],
);

export const quoteItems = pgTable(
  "quote_items",
  {
    ...pk,
    quoteId: uuid("quote_id")
      .notNull()
      .references(() => quotes.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    quantity: numeric("quantity", { precision: 10, scale: 2 })
      .notNull()
      .default("1"),
    unitPriceCents: integer("unit_price_cents").notNull().default(0),
    lineTotalCents: integer("line_total_cents").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("quote_items_quote_idx").on(t.quoteId, t.sortOrder)],
);

// SLV-140 — privacy-first, cookieless analytics. Stores NO personal data:
// coarse country (2-letter), device class, referrer host, UTM campaign, and a
// daily-rotating one-way visitor hash (never the IP). No cookie, no profiling.
export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`uuid_generate_v7()`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    path: text("path").notNull(),
    referrerHost: text("referrer_host"),
    utmSource: text("utm_source"),
    utmMedium: text("utm_medium"),
    utmCampaign: text("utm_campaign"),
    country: text("country"),
    device: text("device"),
    // sha256(ip + ua + day + salt) — one-way, rotates daily, never reversible.
    visitorHash: text("visitor_hash").notNull(),
  },
  (t) => [
    index("page_views_created_idx").on(t.createdAt),
    index("page_views_country_idx").on(t.country),
    index("page_views_campaign_idx").on(t.utmCampaign),
  ],
);
