-- 0002_rls — Row Level Security (SLV-002, 035 → 038)
-- Every table has RLS enabled. Helper predicates are SECURITY DEFINER to avoid
-- recursive policy evaluation on admin_users.

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and disabled_at is null);
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admin_users
    where id = auth.uid() and role = 'owner' and disabled_at is null);
$$;

-- ── Auth & roles ─────────────────────────────────────────────────────────
alter table public.admin_users enable row level security;
create policy admin_users_select on public.admin_users
  for select to authenticated using (public.is_admin());
create policy admin_users_write_owner on public.admin_users
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

alter table public.invitations enable row level security;
create policy invitations_owner on public.invitations
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

alter table public.audit_log enable row level security;
create policy audit_log_insert on public.audit_log
  for insert to authenticated with check (public.is_admin());
create policy audit_log_select_owner on public.audit_log
  for select to authenticated using (public.is_owner());

alter table public.login_attempts enable row level security;
create policy login_attempts_select_owner on public.login_attempts
  for select to authenticated using (public.is_owner());

-- ── Content: published-read for everyone, drafts admin-only (SLV-035/036) ─
alter table public.sections enable row level security;
create policy sections_read on public.sections
  for select using ((status = 'published' and deleted_at is null) or public.is_admin());
create policy sections_write on public.sections
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.services enable row level security;
create policy services_read on public.services
  for select using ((status = 'published' and deleted_at is null) or public.is_admin());
create policy services_write on public.services
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.process_steps enable row level security;
create policy process_steps_read on public.process_steps
  for select using ((status = 'published' and deleted_at is null) or public.is_admin());
create policy process_steps_write on public.process_steps
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.projects enable row level security;
create policy projects_read on public.projects
  for select using ((status = 'published' and deleted_at is null) or public.is_admin());
create policy projects_write on public.projects
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.pricing_plans enable row level security;
create policy pricing_plans_read on public.pricing_plans
  for select using ((status = 'published' and deleted_at is null) or public.is_admin());
create policy pricing_plans_write on public.pricing_plans
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

alter table public.faq_items enable row level security;
create policy faq_items_read on public.faq_items
  for select using ((status = 'published' and deleted_at is null) or public.is_admin());
create policy faq_items_write on public.faq_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- media: readable when not deleted (referenced by published content), admin writes
alter table public.media enable row level security;
create policy media_read on public.media
  for select using (deleted_at is null or public.is_admin());
create policy media_write on public.media
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- legal pages: public read when not deleted, admin writes
alter table public.legal_pages enable row level security;
create policy legal_pages_read on public.legal_pages
  for select using (deleted_at is null or public.is_admin());
create policy legal_pages_write on public.legal_pages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- content revisions: admin only
alter table public.content_revisions enable row level security;
create policy content_revisions_all on public.content_revisions
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- site settings: public read (name/palette used by the public site), owner writes
alter table public.site_settings enable row level security;
create policy site_settings_read on public.site_settings
  for select using (true);
create policy site_settings_write_owner on public.site_settings
  for all to authenticated using (public.is_owner()) with check (public.is_owner());

-- ── Leads: anon INSERT only; reads/updates admin-only (SLV-037) ──────────
alter table public.leads enable row level security;
create policy leads_insert_public on public.leads
  for insert to anon, authenticated with check (true);
create policy leads_select_admin on public.leads
  for select to authenticated using (public.is_admin());
create policy leads_update_admin on public.leads
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy leads_delete_admin on public.leads
  for delete to authenticated using (public.is_admin());

alter table public.lead_events enable row level security;
create policy lead_events_all_admin on public.lead_events
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ── Seed the singleton settings row ──────────────────────────────────────
insert into public.site_settings (baseline, email)
values ('studio de développement', 'bonjour@solive.be')
on conflict do nothing;
