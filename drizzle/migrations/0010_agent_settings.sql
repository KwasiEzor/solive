-- Agent IA de qualification — config editable from /admin/agent-ia without a
-- redeploy (enable/disable, model, custom instructions, encrypted Anthropic
-- credentials). Singleton row, same shape as site_settings. Owner-only RLS:
-- unlike sections/testimonials this table is never publicly readable, even
-- the `enabled` flag — the app reads it via the direct DB connection
-- (bypasses RLS), RLS here is defense-in-depth only.

create table public.agent_settings (
  id uuid primary key default public.uuid_generate_v7(),
  enabled boolean not null default true,
  model text not null default 'claude-haiku-4-5',
  instructions_fr text,
  instructions_en text,
  anthropic_api_key_enc text,
  anthropic_api_key_last4 text,
  anthropic_workspace_id_enc text,
  anthropic_workspace_id_last4 text,
  singleton boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index agent_settings_singleton_idx on public.agent_settings (singleton);

insert into public.agent_settings (singleton) values (true)
  on conflict (singleton) do nothing;

create trigger agent_settings_set_updated before update on public.agent_settings
  for each row execute function public.set_updated_at();

alter table public.agent_settings enable row level security;

create policy agent_settings_owner on public.agent_settings
  for all to authenticated using (public.is_owner()) with check (public.is_owner());
