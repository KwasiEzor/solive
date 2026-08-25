-- SLV-140 — privacy-first, cookieless analytics. No personal data is stored:
-- coarse country, device class, referrer host, UTM campaign, and a daily
-- one-way visitor hash (never the IP). Reads are admin-only; inserts happen
-- server-side with the service role. No cookie, no profiling, no cross-site.

create table public.page_views (
  id uuid primary key default uuid_generate_v7(),
  created_at timestamptz not null default now(),
  path text not null,
  referrer_host text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  device text,
  visitor_hash text not null
);

create index page_views_created_idx on public.page_views (created_at);
create index page_views_country_idx on public.page_views (country);
create index page_views_campaign_idx on public.page_views (utm_campaign);

alter table public.page_views enable row level security;

create policy page_views_read on public.page_views
  for select to authenticated using (public.is_admin());
