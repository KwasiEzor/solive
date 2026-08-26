-- Per-site toggles to show/hide the floating CTA and the palette switcher on
-- the public site, controlled from /admin/parametres. Same singleton row as
-- the rest of site_settings — no new table needed.

alter table public.site_settings
  add column show_float_cta boolean not null default true,
  add column show_theme_switcher boolean not null default true;
