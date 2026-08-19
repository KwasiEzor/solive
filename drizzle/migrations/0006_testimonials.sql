-- SLV-027b — client testimonials (social proof)
-- Table shape mirrors pricing_plans/faq_items: public read when published,
-- admin-only writes, updated_at trigger, logical delete.

create table public.testimonials (
  id uuid primary key default uuid_generate_v7(),
  author text not null,
  role text,
  company text,
  sector text,
  quote text not null,
  rating integer,
  project_slug text,
  avatar_media_id uuid references public.media(id) on delete set null,
  is_featured boolean not null default false,
  sort_order integer not null default 0,
  status publication_status not null default 'draft',
  locale locale not null default 'fr',
  translation_status translation_status not null default 'up_to_date',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index testimonials_status_idx
  on public.testimonials (status, locale, sort_order);

create trigger testimonials_set_updated before update on public.testimonials
  for each row execute function public.set_updated_at();

alter table public.testimonials enable row level security;

create policy testimonials_read on public.testimonials
  for select using (
    (status = 'published' and deleted_at is null) or public.is_admin()
  );

create policy testimonials_write on public.testimonials
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
