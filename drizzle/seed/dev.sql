-- dev seed — published FR content lifted from the maquette (solive-site.jsx).
-- Idempotent: clears content tables first. Applied via MCP / `pnpm db:seed`.
-- NOT run against production.

truncate table public.faq_items, public.pricing_plans, public.projects,
  public.process_steps, public.services, public.sections,
  public.testimonials restart identity cascade;

update public.site_settings set
  name = 'Solive',
  baseline = 'studio de développement',
  email = 'bonjour@solive.pro',
  address = 'Bruxelles, Belgique',
  vat = 'BE 0000.000.000',
  active_palette = 'chaux',
  enabled_locales = '["fr"]'::jsonb
where singleton = true;

-- ── sections (headings/kickers) ──────────────────────────────────────────
insert into public.sections (key, locale, kicker, heading, status, sort_order, published_at) values
 ('hero',    'fr', 'studio de développement — Bruxelles', 'On construit des sites et des applications qui tiennent debout.', 'published', 0, now()),
 ('services','fr', 'Ce qu''on fabrique', 'Trois lots, un seul interlocuteur.', 'published', 1, now()),
 ('methode', 'fr', 'La méthode', 'Quatre étapes. Vous savez toujours où on en est.', 'published', 2, now()),
 ('travaux', 'fr', 'Travaux', 'Ce que ça donne une fois livré.', 'published', 3, now()),
 ('tarifs',  'fr', 'Tarifs', 'Les ordres de grandeur, avant même de s''appeler.', 'published', 4, now()),
 ('faq',     'fr', 'Questions', 'Ce qu''on nous demande avant de signer.', 'published', 5, now()),
 ('contact', 'fr', 'Contact', 'Dites-moi ce que vous voulez construire.', 'published', 6, now());

-- ── services ─────────────────────────────────────────────────────────────
insert into public.services (lot_label, title, summary, bullets, sort_order, status, locale, published_at) values
 ('LOT 01', 'Sites vitrines & refonte',
  'Un site qui charge vite, se lit sur un téléphone et fait sonner le téléphone. Rédaction, design, mise en ligne.',
  '["Design sur mesure, pas de template","SEO technique + Google Business","Formulaire, devis, prise de rendez-vous","Vous récupérez le code et les accès"]'::jsonb,
  0, 'published', 'fr', now()),
 ('LOT 02', 'Applications web sur mesure',
  'Quand le tableur ne suffit plus : votre outil métier, avec vos règles, vos utilisateurs et vos données.',
  '["Comptes, rôles et permissions","Tableau de bord et exports","Paiements et abonnements","Facturation électronique 2026-2027"]'::jsonb,
  1, 'published', 'fr', now()),
 ('LOT 03', 'Applications mobiles',
  'iOS et Android depuis une seule base de code. Publication sur les stores comprise.',
  '["Mode hors-ligne","Notifications push","Appareil photo, GPS, signature","Mises à jour sans repasser par la validation"]'::jsonb,
  2, 'published', 'fr', now());

-- ── process steps ────────────────────────────────────────────────────────
insert into public.process_steps (number, title, description, duration, sort_order, status, locale, published_at) values
 ('01','Cadrage','Un appel de 45 minutes, puis un document écrit : ce qu''on fait, ce qu''on ne fait pas, le prix. Fixe.','1 semaine',0,'published','fr',now()),
 ('02','Plans','Maquettes de chaque écran et arborescence. Vous validez avant qu''une ligne de code soit écrite.','1 semaine',1,'published','fr',now()),
 ('03','Chantier','Développement par itérations. Chaque vendredi, un lien pour voir l''avancement en vrai.','2 à 6 semaines',2,'published','fr',now()),
 ('04','Livraison','Mise en ligne, une heure de prise en main, et tous les accès à votre nom.','2 jours',3,'published','fr',now());

-- ── projects (études de cas) ─────────────────────────────────────────────
insert into public.projects (slug, sector, title, metric_value, metric_label, stack, is_featured, sort_order, status, locale, published_at) values
 ('menuisier-devis-en-ligne','Artisanat','Site + devis en ligne pour un menuisier','×3','demandes de devis en 4 mois','["Next.js","Resend"]'::jsonb, true, 0,'published','fr',now()),
 ('planning-pme-12-personnes','Services','Planning et interventions pour une PME de 12 personnes','6 h','d''administratif économisées / semaine','["React","Supabase"]'::jsonb, false,1,'published','fr',now()),
 ('mvp-mobile-deux-stores','Startup','MVP mobile lancé sur les deux stores','9 sem.','de l''idée à la publication','["React Native","Stripe"]'::jsonb, false,2,'published','fr',now());

-- ── pricing plans ────────────────────────────────────────────────────────
insert into public.pricing_plans (name, price_label, price_note, includes, is_highlighted, sort_order, status, locale, published_at) values
 ('Site vitrine','1 900 €','à partir de','["Jusqu''à 6 pages","Design sur mesure","SEO technique","Hébergement 1 an offert"]'::jsonb, false,0,'published','fr',now()),
 ('Application web','6 500 €','à partir de','["Comptes et permissions","Base de données","Tableau de bord","Paiements en ligne"]'::jsonb, true,1,'published','fr',now()),
 ('Application mobile','9 000 €','à partir de','["iOS + Android","Publication sur les stores","Notifications push","Mode hors-ligne"]'::jsonb, false,2,'published','fr',now());

-- ── faq ──────────────────────────────────────────────────────────────────
insert into public.faq_items (question, answer, sort_order, status, locale, published_at) values
 ('Combien de temps avant d''être en ligne ?', to_jsonb('Quatre à six semaines pour un site vitrine, deux à quatre mois pour une application. Le calendrier est daté dans le devis, pas estimé à la louche.'::text), 0,'published','fr',now()),
 ('Le prix peut-il bouger en cours de route ?', to_jsonb('Non. Le devis est fixe pour le périmètre écrit. Si vous ajoutez quelque chose en cours de chantier, je chiffre l''ajout séparément et vous décidez.'::text), 1,'published','fr',now()),
 ('À qui appartient le site à la fin ?', to_jsonb('À vous. Le code, le nom de domaine, l''hébergement, les comptes : tout est créé à votre nom et vous en avez les clés. Vous pouvez partir avec.'::text), 2,'published','fr',now()),
 ('Et la facture électronique obligatoire ?', to_jsonb('La réception devient obligatoire en France en septembre 2026, l''émission en 2027, avec un calendrier proche en Belgique. Les outils que je construis sont prêts pour le format Factur-X et le réseau Peppol.'::text), 3,'published','fr',now()),
 ('Vous travaillez en dehors de la Belgique ?', to_jsonb('Oui, en France et au Luxembourg. Le cadrage se fait en visio, le reste par écrit. Je me déplace pour les projets qui le justifient.'::text), 4,'published','fr',now());

-- ── témoignages (EXEMPLES — à remplacer par de vrais avis clients) ────────
insert into public.testimonials (author, role, company, sector, quote, rating, project_slug, is_featured, sort_order, status, locale, published_at) values
 ('Julien Bastin','Gérant','Menuiserie Bastin','Artisanat','Devis fixe tenu, livré dans les temps, et je récupère les demandes de devis directement en ligne. Je parle à la personne qui code, pas à un commercial.',5,'menuisier-devis-en-ligne', true, 0,'published','fr',now()),
 ('Sofia Renard','Fondatrice','Atelier Renard','Commerce','Un site qui charge vite et qui me ressemble. Le calendrier daté m''a rassurée dès le départ : je savais toujours où on en était.',5, null, false, 1,'published','fr',now()),
 ('Marc Vanden Berghe','Directeur','VDB Logistics','PME','Outil métier livré sans rallonge surprise. Le code est à notre nom, hébergé en Europe. Exactement ce qui était écrit dans le devis.',5, null, false, 2,'published','fr',now()),
 ('Nadia El Amrani','Responsable support','Optique Verville','IA · Assistant client','L''assistant répond à nos clients la nuit, cite ses sources, et passe la main quand il ne sait pas. Zéro réponse inventée — on l''a mesuré avant la mise en ligne.',5, null, false, 3,'published','fr',now()),
 ('Thomas Léonard','Cofondateur','Flux Compta','IA · Automatisation','Extraction de factures automatisée, prête pour Peppol 2026. On a récupéré des heures chaque semaine, et les données restent en Europe.',5, null, false, 4,'published','fr',now()),
 ('Camille Dubois','Directrice','Studio Klar','IA · Agent de qualification','L''agent qualifie les demandes avant qu''on décroche : on arrive à l''appel avec le contexte. Et surtout, pas de lock-in — tout est à notre nom.',5, null, false, 5,'published','fr',now());
