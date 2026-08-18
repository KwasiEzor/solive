-- 0001_init — Solive schema (SLV-010 → 031, 097)
-- Functions, enums, tables, updated_at triggers, audit_log immutability, indexes.

-- ── Helper: UUID v7 (time-ordered) — PG17 has no native uuidv7() ──────────
create or replace function public.uuid_generate_v7()
returns uuid
language plpgsql
volatile
as $$
declare
  unix_ts_ms bytea;
  uuid_bytes bytea;
begin
  unix_ts_ms := substring(
    int8send(floor(extract(epoch from clock_timestamp()) * 1000)::bigint) from 3);
  uuid_bytes := uuid_send(gen_random_uuid());
  uuid_bytes := overlay(uuid_bytes placing unix_ts_ms from 1 for 6);
  -- version 7 in the high nibble of byte 6
  uuid_bytes := set_byte(uuid_bytes, 6,
    (b'0111' || get_byte(uuid_bytes, 6)::bit(4))::bit(8)::int);
  -- RFC 4122 variant (10) in the top bits of byte 8
  uuid_bytes := set_byte(uuid_bytes, 8,
    (b'10' || get_byte(uuid_bytes, 8)::bit(6))::bit(8)::int);
  return encode(uuid_bytes, 'hex')::uuid;
end
$$;

-- ── Helper: updated_at maintenance ───────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end
$$;

-- ── Helper: forbid UPDATE/DELETE (audit_log immutability — SLV-012) ───────
create or replace function public.forbid_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'append-only table: % not allowed', tg_op;
end
$$;

-- ── Enums ────────────────────────────────────────────────────────────────
create type public.user_role as enum ('owner', 'editor');
create type public.publication_status as enum ('draft', 'published');
create type public.locale as enum ('fr', 'nl', 'en');
create type public.palette as enum ('chaux', 'ardoise', 'cobalt');
create type public.audit_action as enum (
  'create', 'update', 'delete', 'publish', 'unpublish',
  'restore', 'login', 'invite', 'role_change', 'reorder');
create type public.lead_source as enum ('web', 'offline_sync');
create type public.lead_status as enum ('new', 'contacted', 'quoted', 'won', 'lost');
create type public.lead_event_type as enum ('status_change', 'email_sent', 'note');
create type public.translation_status as enum ('to_translate', 'up_to_date', 'outdated');

-- ═══ 4.1 Auth & roles ════════════════════════════════════════════════════

create table public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  role public.user_role not null default 'editor',
  mfa_enrolled_at timestamptz,
  last_seen_at timestamptz,
  disabled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invitations (
  id uuid primary key default public.uuid_generate_v7(),
  email text not null,
  role public.user_role not null default 'editor',
  token_hash text not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  invited_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index invitations_token_hash_idx on public.invitations (token_hash);
create index invitations_email_idx on public.invitations (email);

create table public.audit_log (
  id uuid primary key default public.uuid_generate_v7(),
  actor_id uuid references public.admin_users(id) on delete set null,
  action public.audit_action not null,
  entity_type text not null,
  entity_id text,
  diff jsonb,
  ip_hash text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index audit_log_actor_idx on public.audit_log (actor_id);
create index audit_log_created_idx on public.audit_log (created_at);
create index audit_log_entity_idx on public.audit_log (entity_type, entity_id);
create trigger audit_log_no_update before update on public.audit_log
  for each row execute function public.forbid_mutation();
create trigger audit_log_no_delete before delete on public.audit_log
  for each row execute function public.forbid_mutation();

create table public.login_attempts (
  id uuid primary key default public.uuid_generate_v7(),
  email_hash text not null,
  ip_hash text not null,
  succeeded boolean not null default false,
  created_at timestamptz not null default now()
);
create index login_attempts_email_idx on public.login_attempts (email_hash, created_at);
create index login_attempts_ip_idx on public.login_attempts (ip_hash, created_at);

-- ═══ 4.2 Content ═════════════════════════════════════════════════════════

create table public.site_settings (
  id uuid primary key default public.uuid_generate_v7(),
  name text not null default 'Solive',
  baseline text,
  email text,
  phone text,
  address text,
  vat text,
  socials jsonb default '{}'::jsonb,
  active_palette public.palette not null default 'chaux',
  enabled_locales jsonb not null default '["fr"]'::jsonb,
  singleton boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
-- singleton: only one row may exist
create unique index site_settings_singleton_idx on public.site_settings (singleton);

create table public.sections (
  id uuid primary key default public.uuid_generate_v7(),
  key text not null,
  locale public.locale not null default 'fr',
  heading text,
  kicker text,
  body jsonb,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  status public.publication_status not null default 'draft',
  translation_status public.translation_status not null default 'up_to_date',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index sections_key_locale_idx on public.sections (key, locale);
create index sections_status_idx on public.sections (status, locale);

create table public.services (
  id uuid primary key default public.uuid_generate_v7(),
  lot_label text,
  title text not null,
  summary text,
  bullets jsonb not null default '[]'::jsonb,
  icon_key text,
  sort_order integer not null default 0,
  status public.publication_status not null default 'draft',
  locale public.locale not null default 'fr',
  translation_status public.translation_status not null default 'up_to_date',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index services_status_idx on public.services (status, locale, sort_order);

create table public.process_steps (
  id uuid primary key default public.uuid_generate_v7(),
  number text not null,
  title text not null,
  description text,
  duration text,
  sort_order integer not null default 0,
  status public.publication_status not null default 'draft',
  locale public.locale not null default 'fr',
  translation_status public.translation_status not null default 'up_to_date',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index process_steps_status_idx on public.process_steps (status, locale, sort_order);

create table public.media (
  id uuid primary key default public.uuid_generate_v7(),
  cloudinary_public_id text not null,
  format text,
  width integer,
  height integer,
  bytes integer,
  alt_text text not null,           -- SLV-027: mandatory
  caption text,
  blur_data_url text,
  uploaded_by uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index media_public_id_idx on public.media (cloudinary_public_id);

create table public.projects (
  id uuid primary key default public.uuid_generate_v7(),
  slug text not null,
  sector text,
  title text not null,
  metric_value text,
  metric_label text,
  stack jsonb not null default '[]'::jsonb,
  body jsonb,
  cover_media_id uuid references public.media(id) on delete set null,
  gallery jsonb not null default '[]'::jsonb,
  client_name text,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status public.publication_status not null default 'draft',
  published_at timestamptz,
  locale public.locale not null default 'fr',
  translation_status public.translation_status not null default 'up_to_date',
  meta_title text,
  meta_description text,
  og_media_id uuid references public.media(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index projects_slug_locale_idx on public.projects (slug, locale);
create index projects_status_idx on public.projects (status, locale, sort_order);
create index projects_featured_idx on public.projects (is_featured);

create table public.pricing_plans (
  id uuid primary key default public.uuid_generate_v7(),
  name text not null,
  price_label text,
  price_note text,
  includes jsonb not null default '[]'::jsonb,
  is_highlighted boolean not null default false,
  sort_order integer not null default 0,
  status public.publication_status not null default 'draft',
  locale public.locale not null default 'fr',
  translation_status public.translation_status not null default 'up_to_date',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index pricing_plans_status_idx on public.pricing_plans (status, locale, sort_order);

create table public.faq_items (
  id uuid primary key default public.uuid_generate_v7(),
  question text not null,
  answer jsonb,
  sort_order integer not null default 0,
  status public.publication_status not null default 'draft',
  locale public.locale not null default 'fr',
  translation_status public.translation_status not null default 'up_to_date',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index faq_items_status_idx on public.faq_items (status, locale, sort_order);

create table public.content_revisions (
  id uuid primary key default public.uuid_generate_v7(),
  entity_type text not null,
  entity_id uuid not null,
  snapshot jsonb not null,
  author_id uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index content_revisions_entity_idx
  on public.content_revisions (entity_type, entity_id, created_at);

create table public.legal_pages (
  id uuid primary key default public.uuid_generate_v7(),
  slug text not null,
  title text,
  body jsonb,
  locale public.locale not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create unique index legal_pages_slug_locale_idx on public.legal_pages (slug, locale);

-- ═══ 4.3 Leads ═══════════════════════════════════════════════════════════

create table public.leads (
  id uuid primary key default public.uuid_generate_v7(),
  client_id uuid not null,           -- idempotency for offline replays (SLV-084)
  name text not null,
  email text not null,
  company text,
  project_types jsonb not null default '[]'::jsonb,
  message text not null,
  budget_range text,
  locale public.locale not null default 'fr',
  source public.lead_source not null default 'web',
  status public.lead_status not null default 'new',
  internal_notes text,
  ip_hash text,
  user_agent text,
  turnstile_ok boolean not null default false,
  spam_score integer,
  client_submitted_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index leads_client_id_idx on public.leads (client_id);
create index leads_status_idx on public.leads (status, created_at);
create index leads_created_idx on public.leads (created_at);

create table public.lead_events (
  id uuid primary key default public.uuid_generate_v7(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  type public.lead_event_type not null,
  payload jsonb,
  actor_id uuid references public.admin_users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index lead_events_lead_idx on public.lead_events (lead_id, created_at);

-- ── updated_at triggers (content + auth tables that carry updated_at) ─────
create trigger admin_users_set_updated before update on public.admin_users
  for each row execute function public.set_updated_at();
create trigger invitations_set_updated before update on public.invitations
  for each row execute function public.set_updated_at();
create trigger site_settings_set_updated before update on public.site_settings
  for each row execute function public.set_updated_at();
create trigger sections_set_updated before update on public.sections
  for each row execute function public.set_updated_at();
create trigger services_set_updated before update on public.services
  for each row execute function public.set_updated_at();
create trigger process_steps_set_updated before update on public.process_steps
  for each row execute function public.set_updated_at();
create trigger media_set_updated before update on public.media
  for each row execute function public.set_updated_at();
create trigger projects_set_updated before update on public.projects
  for each row execute function public.set_updated_at();
create trigger pricing_plans_set_updated before update on public.pricing_plans
  for each row execute function public.set_updated_at();
create trigger faq_items_set_updated before update on public.faq_items
  for each row execute function public.set_updated_at();
create trigger legal_pages_set_updated before update on public.legal_pages
  for each row execute function public.set_updated_at();
