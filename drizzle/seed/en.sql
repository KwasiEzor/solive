-- English content rows for the i18n rollout (SLV i18n). Mirrors dev.sql's
-- French rows: same keys/slugs where the schema ties locales together
-- (sections.key, projects.slug), independent rows otherwise (services,
-- process_steps, pricing_plans, faq_items, testimonials have no cross-locale
-- unique constraint). Idempotent per row via `on conflict` where a unique
-- index exists; plain guarded inserts (not already present) elsewhere.

-- sections
insert into sections (key, kicker, heading, body, locale, translation_status, is_visible)
values
  ('hero', 'dev studio — Charleroi', 'We build strong.', '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb, 'en', 'up_to_date', true),
  ('services', 'What we build', 'Three offerings, one point of contact.', null, 'en', 'up_to_date', true),
  ('methode', 'The method', 'Four steps. You always know where things stand.', null, 'en', 'up_to_date', true),
  ('travaux', 'Work', 'What it looks like once delivered.', null, 'en', 'up_to_date', true),
  ('tarifs', 'Pricing', 'The ballpark figures, before we even talk.', null, 'en', 'up_to_date', true),
  ('contact', 'Contact', 'Tell me what you want to build.', null, 'en', 'up_to_date', true),
  ('faq', 'Questions', 'What people ask before signing.', null, 'en', 'up_to_date', true)
on conflict (key, locale) do update set
  kicker = excluded.kicker, heading = excluded.heading, body = excluded.body;

-- services
insert into services (lot_label, title, summary, bullets, sort_order, status, locale, translation_status, published_at)
select 'LOT 01', 'Showcase sites & redesigns',
  'A site that loads fast, reads well on a phone, and makes the phone ring. Copywriting, design, launch.',
  '["Tailor-made design, no templates","Technical SEO + Google Business","Contact form, quotes, booking","You keep the code and the access"]'::jsonb,
  0, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from services where locale = 'en' and title = 'Showcase sites & redesigns');

insert into services (lot_label, title, summary, bullets, sort_order, status, locale, translation_status, published_at)
select 'LOT 02', 'Tailor-made web applications',
  'When a spreadsheet isn''t enough anymore: your own business tool, with your rules, your users and your data.',
  '["Accounts, roles and permissions","Dashboard and exports","Payments and subscriptions","E-invoicing 2026-2027"]'::jsonb,
  1, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from services where locale = 'en' and title = 'Tailor-made web applications');

insert into services (lot_label, title, summary, bullets, sort_order, status, locale, translation_status, published_at)
select 'LOT 03', 'Mobile applications',
  'iOS and Android from a single codebase. Store publishing included.',
  '["Offline mode","Push notifications","Camera, GPS, signature","Updates without going through review again"]'::jsonb,
  2, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from services where locale = 'en' and title = 'Mobile applications');

-- process_steps
insert into process_steps (number, title, description, duration, sort_order, status, locale, translation_status, published_at)
select '01', 'Scoping',
  'A 45-minute call, then a written document: what we do, what we don''t, the price. Fixed.',
  '1 week', 0, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from process_steps where locale = 'en' and number = '01');

insert into process_steps (number, title, description, duration, sort_order, status, locale, translation_status, published_at)
select '02', 'Plans',
  'Mockups of every screen and the sitemap. You approve before a line of code is written.',
  '1 week', 1, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from process_steps where locale = 'en' and number = '02');

insert into process_steps (number, title, description, duration, sort_order, status, locale, translation_status, published_at)
select '03', 'Build',
  'Iterative development. Every Friday, a link to see real progress.',
  '2 to 6 weeks', 2, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from process_steps where locale = 'en' and number = '03');

insert into process_steps (number, title, description, duration, sort_order, status, locale, translation_status, published_at)
select '04', 'Delivery',
  'Launch, a one-hour handover, and every access in your name.',
  '2 days', 3, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from process_steps where locale = 'en' and number = '04');

-- projects (shares slug with the fr row — getProjectBySlug(slug, locale) relies on this)
insert into projects (slug, title, sector, metric_value, metric_label, stack, status, locale, translation_status, published_at)
values
  ('menuisier-devis-en-ligne', 'Site + online quotes for a woodworker', 'Trades', '×3', 'quote requests in 4 months', '["Next.js","Resend"]'::jsonb, 'published', 'en', 'up_to_date', now()),
  ('planning-pme-12-personnes', 'Scheduling and dispatch for a 12-person SME', 'Services', '6 h', 'of admin work saved / week', '["React","Supabase"]'::jsonb, 'published', 'en', 'up_to_date', now()),
  ('mvp-mobile-deux-stores', 'Mobile MVP launched on both stores', 'Startup', '9 wks', 'from idea to launch', '["React Native","Stripe"]'::jsonb, 'published', 'en', 'up_to_date', now())
on conflict (slug, locale) do update set
  title = excluded.title, sector = excluded.sector, metric_value = excluded.metric_value,
  metric_label = excluded.metric_label, stack = excluded.stack;

-- pricing_plans
insert into pricing_plans (name, price_label, price_note, includes, is_highlighted, sort_order, status, locale, translation_status, published_at)
select 'Showcase site', '€1,900', 'starting at',
  '["Up to 6 pages","Tailor-made design","Technical SEO","1 year hosting included"]'::jsonb,
  false, 0, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from pricing_plans where locale = 'en' and name = 'Showcase site');

insert into pricing_plans (name, price_label, price_note, includes, is_highlighted, sort_order, status, locale, translation_status, published_at)
select 'Web application', '€6,500', 'starting at',
  '["Accounts and permissions","Database","Dashboard","Online payments"]'::jsonb,
  true, 1, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from pricing_plans where locale = 'en' and name = 'Web application');

insert into pricing_plans (name, price_label, price_note, includes, is_highlighted, sort_order, status, locale, translation_status, published_at)
select 'Mobile application', '€9,000', 'starting at',
  '["iOS + Android","Store publishing","Push notifications","Offline mode"]'::jsonb,
  false, 2, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from pricing_plans where locale = 'en' and name = 'Mobile application');

-- faq_items
insert into faq_items (question, answer, sort_order, status, locale, translation_status, published_at)
select 'How long before we''re live?',
  '"Four to six weeks for a showcase site, two to four months for an application. The schedule is dated in the quote, not roughly estimated."'::jsonb,
  0, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from faq_items where locale = 'en' and question = 'How long before we''re live?');

insert into faq_items (question, answer, sort_order, status, locale, translation_status, published_at)
select 'Can the price change along the way?',
  '"No. The quote is fixed for the written scope. If you add something during the build, I price the addition separately and you decide."'::jsonb,
  1, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from faq_items where locale = 'en' and question = 'Can the price change along the way?');

insert into faq_items (question, answer, sort_order, status, locale, translation_status, published_at)
select 'Who owns the site at the end?',
  '"You do. The code, the domain name, the hosting, the accounts: everything is created in your name and you hold the keys. You can walk away with it."'::jsonb,
  2, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from faq_items where locale = 'en' and question = 'Who owns the site at the end?');

insert into faq_items (question, answer, sort_order, status, locale, translation_status, published_at)
select 'What about mandatory e-invoicing?',
  '"Receiving becomes mandatory in France in September 2026, issuing in 2027, with a similar timeline in Belgium close behind. The tools I build are ready for the Factur-X format and the Peppol network."'::jsonb,
  3, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from faq_items where locale = 'en' and question = 'What about mandatory e-invoicing?');

insert into faq_items (question, answer, sort_order, status, locale, translation_status, published_at)
select 'Do you work outside Belgium?',
  '"Yes, in France and Luxembourg. Scoping happens over video call, everything else in writing. I travel for projects that warrant it."'::jsonb,
  4, 'published', 'en', 'up_to_date', now()
where not exists (select 1 from faq_items where locale = 'en' and question = 'Do you work outside Belgium?');

-- testimonials (names/companies unchanged — real business names, not translated)
insert into testimonials (author, role, company, sector, quote, rating, project_slug, is_featured, sort_order, status, locale)
select 'Julien Bastin', 'Owner', 'Menuiserie Bastin', 'Trades',
  'Fixed quote honored, delivered on time, and I get quote requests straight online. I talk to the person who writes the code, not a salesperson.',
  5, 'menuisier-devis-en-ligne', true, 0, 'published', 'en'
where not exists (select 1 from testimonials where locale = 'en' and author = 'Julien Bastin');

insert into testimonials (author, role, company, sector, quote, rating, project_slug, is_featured, sort_order, status, locale)
select 'Sofia Renard', 'Founder', 'Atelier Renard', 'Retail',
  'A site that loads fast and feels like me. The dated schedule reassured me from the start: I always knew where things stood.',
  5, null, false, 1, 'published', 'en'
where not exists (select 1 from testimonials where locale = 'en' and author = 'Sofia Renard');

insert into testimonials (author, role, company, sector, quote, rating, project_slug, is_featured, sort_order, status, locale)
select 'Marc Vanden Berghe', 'Director', 'VDB Logistics', 'SME',
  'Business tool delivered with no surprise add-ons. The code is in our name, hosted in Europe. Exactly what was written in the quote.',
  5, null, false, 2, 'published', 'en'
where not exists (select 1 from testimonials where locale = 'en' and author = 'Marc Vanden Berghe');

insert into testimonials (author, role, company, sector, quote, rating, project_slug, is_featured, sort_order, status, locale)
select 'Nadia El Amrani', 'Support lead', 'Optique Verville', 'AI · Client assistant',
  'The assistant answers our clients at night, cites its sources, and hands off when it doesn''t know. Zero made-up answers — we measured it before launch.',
  5, null, false, 3, 'published', 'en'
where not exists (select 1 from testimonials where locale = 'en' and author = 'Nadia El Amrani');

insert into testimonials (author, role, company, sector, quote, rating, project_slug, is_featured, sort_order, status, locale)
select 'Thomas Léonard', 'Co-founder', 'Flux Compta', 'AI · Automation',
  'Automated invoice extraction, ready for Peppol 2026. We got hours back every week, and the data stays in Europe.',
  5, null, false, 4, 'published', 'en'
where not exists (select 1 from testimonials where locale = 'en' and author = 'Thomas Léonard');

insert into testimonials (author, role, company, sector, quote, rating, project_slug, is_featured, sort_order, status, locale)
select 'Camille Dubois', 'Director', 'Studio Klar', 'AI · Qualification agent',
  'The agent qualifies requests before we pick up: we come to the call with context already in hand. And crucially, no lock-in — everything is in our name.',
  5, null, false, 5, 'published', 'en'
where not exists (select 1 from testimonials where locale = 'en' and author = 'Camille Dubois');
