-- Devis (quotes) generated from leads. Admin-only, no public access — a
-- quote isn't published content, it's an operational document tied to a lead.

create type public.quote_status as enum ('draft', 'sent', 'accepted', 'declined');

create table public.quote_number_counters (
  year integer primary key,
  last_number integer not null default 0
);

create table public.quotes (
  id uuid primary key default uuid_generate_v7(),
  number text not null,
  year integer not null,
  sequence_number integer not null,
  lead_id uuid references public.leads(id) on delete set null,
  client_name text not null,
  client_email text not null,
  client_company text,
  status public.quote_status not null default 'draft',
  vat_rate numeric(5,2) not null default 21.00,
  subtotal_cents integer not null default 0,
  vat_amount_cents integer not null default 0,
  total_cents integer not null default 0,
  valid_until timestamptz,
  notes text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.quote_items (
  id uuid primary key default uuid_generate_v7(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  description text not null,
  quantity numeric(10,2) not null default 1,
  unit_price_cents integer not null default 0,
  line_total_cents integer not null default 0,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index quotes_number_idx on public.quotes (number);
create index quotes_lead_idx on public.quotes (lead_id);
create index quotes_status_idx on public.quotes (status, created_at);
create index quote_items_quote_idx on public.quote_items (quote_id, sort_order);

create trigger quotes_set_updated before update on public.quotes
  for each row execute function public.set_updated_at();
create trigger quote_items_set_updated before update on public.quote_items
  for each row execute function public.set_updated_at();

alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.quote_number_counters enable row level security;

create policy quotes_all_admin on public.quotes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy quote_items_all_admin on public.quote_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy quote_number_counters_all_admin on public.quote_number_counters
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
