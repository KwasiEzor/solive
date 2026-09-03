/**
 * Static UI copy that isn't DB-backed content, keyed by namespace (roughly
 * one block per component). Mirrors the fr/en `COPY` pattern already used in
 * src/emails/lead-acknowledgment.tsx. DB content (sections, services, faq,
 * projects, pricing plans, testimonials, legal pages) is translated via its
 * own `locale` column instead — see src/server/queries/content.ts.
 */
export const fr = {
  common: {
    skipLink: "Aller au contenu",
    switchToFr: "Passer en français",
    switchToEn: "Switch to English",
    baseline: "studio de développement",
    ville: "Charleroi",
  },
  nav: {
    links: {
      home: "Accueil",
      services: "Services",
      ia: "IA",
      realisations: "Réalisations",
      pourquoiSolive: "Pourquoi Solive",
      tarifs: "Tarifs",
    },
    cta: "Parler du projet",
    ariaMain: "Navigation principale",
    ariaMenuOpen: "Ouvrir le menu",
    ariaMenuClose: "Fermer le menu",
    brandAria: (brand: string) => `${brand}, accueil`,
  },
  footer: {
    pourquoi:
      "Une solive, c’est la poutre qu’on ne voit jamais et sur laquelle repose tout le plancher. On construit solide.",
    belgique: "Belgique",
    contact: "Contact",
    formulaire: "Formulaire",
    legal: "Légal",
    mentionsLegales: "Mentions légales",
    confidentialite: "Confidentialité",
    cookies: "Cookies",
    tva: (vat: string) => `TVA ${vat}`,
    faitA: (ville: string) => `Fait à ${ville}. Hébergé en Europe.`,
  },
  hero: {
    lede: "Vitrines, outils métier, apps mobiles. Pour les artisans, les PME et les startups en Belgique, en France et au Luxembourg. Devis fixe, calendrier daté, code livré à votre nom.",
    ctaPrimary: "Prendre 20 minutes",
    ctaSecondary: "Voir comment on travaille",
    facts: ["4 à 6 semaines pour un site", "Prix fixe, pas de rallonge", "Vous gardez le code"],
    buildStrong: "BUILD STRONG",
  },
  ticker: {
    items: [
      "Next.js",
      "TypeScript",
      "React Native",
      "Supabase",
      "Agents IA",
      "RAG",
      "Mistral / Llama",
      "Évals & garde-fous",
      "Stripe",
      "Tailwind",
      "Vercel",
      "SEO technique",
      "Facture électronique 2026",
      "RGPD & AI Act",
    ],
  },
  sectionsFallback: {
    services: { kicker: "Ce qu'on fabrique", titre: "Trois lots, un seul interlocuteur." },
    methode: { kicker: "La méthode", titre: "Quatre étapes. Vous savez toujours où on en est." },
    travaux: { kicker: "Travaux", titre: "Ce que ça donne une fois livré." },
    tarifs: { kicker: "Tarifs", titre: "Les ordres de grandeur, avant même de s'appeler." },
    temoignages: { kicker: "Ils en parlent", titre: "Ce que disent les gens pour qui j’ai livré." },
    faq: { kicker: "Questions", titre: "Ce qu'on nous demande avant de signer." },
  },
  services: {
    caseStudyAria: (title: string) => `Voir l’étude de cas : ${title}`,
  },
  pricing: {
    mostRequested: "Le plus demandé",
    requestQuote: "Demander un devis",
    maintenanceNote: "Entretien, hébergement et petites évolutions : 90 € / mois, sans engagement. Prix hors TVA.",
  },
  testimonialsWall: {
    starsAria: (n: number) => `${n} sur 5`,
    pause: "❚❚ Mettre en pause",
    resume: "▶ Reprendre le défilement",
    caseStudyAria: (author: string) => `Étude de cas liée à l’avis de ${author}`,
  },
  planCycle: {
    typeAria: "Type de projet",
    planLabel: (n: number) => `PLAN ${String(n).padStart(2, "0")}/03`,
    schemaAria: (label: string) => `Schéma : ${label}`,
    plans: {
      vitrine: {
        label: "Site vitrine",
        cote: "page d'accueil — 1,2 s de chargement",
        annot: "SEO technique",
      },
      app: {
        label: "Application web",
        cote: "tableau de bord — vos règles métier",
        annot: "comptes + rôles",
      },
      mobile: {
        label: "Application mobile",
        cote: "iOS + Android — une seule base de code",
        annot: "hors-ligne",
      },
    },
  },
  floatCta: { label: "Prendre 20 minutes" },
  scrollTop: { ariaLabel: "Remonter en haut" },
  paletteSwitch: {
    ariaLabel: "Changer la palette de couleurs",
    chaux: "Chaux (clair)",
    ardoise: "Ardoise (sombre)",
    cobalt: "Cobalt (bleu)",
  },
  consentBanner: {
    ariaLabel: "Consentement aux cookies",
    textBold: "On respecte votre vie privée.",
    textRest: " Ce site ne dépose aucun cookie de suivi. On mesure l’audience de façon anonyme — sans cookie, sans donnée personnelle — et vous pouvez refuser en un clic.",
    learnMore: "En savoir plus",
    refuse: "Refuser le non-essentiel",
    acceptAll: "Tout accepter",
  },
  networkStatus: {
    offline: "Hors ligne — vos actions sont conservées",
    pending: (n: number) => `${n} demande${n > 1 ? "s" : ""} en attente d’envoi`,
  },
  swUpdate: {
    available: "Une nouvelle version est disponible.",
    reload: "Recharger",
    later: "Plus tard",
  },
  whySolive: {
    values: [
      [
        "Prix fixe, dit une fois",
        "Le devis couvre le périmètre écrit. Pas de ligne surprise à la fin, pas de « ça dépend » à chaque question.",
      ],
      [
        "Le code vous appartient",
        "Livré à votre nom, sur vos comptes. Vous pouvez partir avec — et le fait de pouvoir partir, c’est ce qui garde la relation honnête.",
      ],
      [
        "Hébergé en Europe",
        "Vos données et celles de vos clients restent sous droit européen. Pas un détail : un choix.",
      ],
      [
        "On mesure, on ne promet pas",
        "Un temps de chargement, un taux d’erreur d’un assistant IA, un délai de livraison : des chiffres vérifiables, pas des éléments de langage.",
      ],
      [
        "Direct, sans commercial",
        "La personne qui répond à l’appel de cadrage est celle qui écrit le code. Rien ne se perd dans la traduction.",
      ],
      [
        "Le périmètre avant le clavier",
        "Cadrage écrit, maquettes validées, puis développement. Vous savez ce que vous obtenez avant qu’une ligne de code soit écrite.",
      ],
    ] as [string, string][],
    valuesHead: { eyebrow: "CE QU’ON DÉFEND", h2: "Des principes, pas des éléments de langage." },
    skills: [
      ["Web & mobile", ["Next.js", "TypeScript", "React Native", "Tailwind"]],
      ["Données & infra", ["Supabase", "PostgreSQL", "Vercel", "Stripe"]],
      ["IA & agents", ["RAG", "Mistral / Llama", "Évals & garde-fous", "AI Gateway"]],
    ] as [string, string[]][],
    skillsHead: {
      eyebrow: "CE QU’ON SAIT FAIRE",
      h2: "Un stack resserré, tenu à jour — pas cent technologies à moitié maîtrisées.",
    },
    founder: {
      eyebrow: "LA PERSONNE DERRIÈRE SOLIVE",
      p1: "Solive est un atelier d’une seule personne, par choix. Pas de chef de projet entre vous et le code, pas de commercial qui chiffre ce qu’il ne construira pas. Le cadrage, le développement, la mise en ligne et le café du matin : la même personne, du premier appel à la livraison.",
      p2: "C’est un choix de taille, pas un manque de moyens : rester petit pour rester direct, mesurer ce qu’on livre plutôt que de le survendre, et ne prendre que les projets qu’on peut honorer avec un devis fixe.",
    },
    vision: {
      eyebrow: "LA VISION",
      h2: "Rester un atelier, même en grandissant.",
      p1: "Le marché du développement se remplit de promesses génériques — « on fait de l’IA », « on livre vite », « on est experts ». Solive part du principe inverse : dire moins, mais le tenir. Un devis fixe qui ne bouge pas. Un calendrier daté qui se respecte. Une IA qui cite ses sources au lieu d’inventer. Du code que vous possédez réellement, pas que vous louez.",
      p2: "À mesure que Solive grandit, l’objectif n’est pas de devenir une agence de plus, mais de rester l’atelier où l’on peut encore appeler directement la personne qui a écrit votre code — et d’étendre ce qu’on sait faire (notamment sur l’IA appliquée aux métiers) sans jamais perdre cette proximité.",
      cta: "En discuter directement",
    },
  },
  ia: {
    serviceType: "Intelligence artificielle — assistants et agents",
    jsonLdDescription:
      "Assistants IA (RAG), agents de qualification, automatisations métier. Hébergé en Europe, sans lock-in, garde-fous et évals.",
    diffsHead: {
      eyebrow: "CE QUI NOUS SÉPARE DU LOT",
      h2: "Tout le monde branche un chatbot. Peu livrent une IA qui tient debout.",
    },
    diffs: [
      [
        "Souveraineté des données",
        "Envoyées aux serveurs américains, réutilisées pour l’entraînement.",
        "Traitées en Europe, zéro rétention, DPA fourni. Vos données restent les vôtres.",
      ],
      [
        "Zéro lock-in",
        "Enfermé chez un fournisseur, impossible d’en sortir.",
        "Modèles interchangeables, prompts et évals à votre nom, export ouvert.",
      ],
      [
        "Garde-fous & évals",
        "Une démo qui hallucine une fois en production.",
        "Testé, mesuré, borné : garde-fous PII/injection, taux d’erreur chiffré avant la mise en ligne.",
      ],
      [
        "Ancré dans le métier",
        "Un chatbot générique déconnecté de votre activité.",
        "RAG sur vos documents, branché à vos outils (facturation, agenda, CRM).",
      ],
      [
        "Réponses sourcées",
        "Invente une réponse avec aplomb.",
        "Cite ses sources et dit « je ne sais pas » plutôt que d’inventer.",
      ],
      [
        "Prix & résultat",
        "Facturation à l’heure, périmètre flou.",
        "Devis fixe, audit d’abord, résultat mesuré (heures économisées).",
      ],
    ] as [string, string, string][],
    useCasesHead: { eyebrow: "CE QU’ON FABRIQUE", h2: "Des assistants et des agents ancrés dans votre métier." },
    useCases: [
      [
        "Assistant client (RAG)",
        "Répond à vos clients à partir de vos documents. Support et FAQ 24/7, chaque réponse sourcée.",
        "/images/code-screen.jpg",
      ],
      [
        "Agent de qualification",
        "Qualifie vos leads, répond la nuit, propose un créneau. Vous récupérez des demandes prêtes à traiter.",
        "/images/mobile-app.jpg",
      ],
      [
        "Copilote interne",
        "Cherche dans vos documents, résume, rédige des brouillons. Vos équipes gagnent des heures.",
        "/images/code-macro.jpg",
      ],
      [
        "Automatisations métier",
        "Tri d’emails, extraction de PDF et de factures, saisie évitée. L’IA fait la corvée, pas vous.",
        "/images/circuit.jpg",
      ],
      [
        "Facture électronique 2026",
        "Extraction et contrôle Factur-X / Peppol, prêts pour l’obligation qui arrive en 2026–2027.",
        "/images/dev-desk.jpg",
      ],
      [
        "Recherche IA (GEO)",
        "Être trouvé et cité par les moteurs génératifs, pas seulement référencé par Google.",
        "/images/server.jpg",
      ],
    ] as [string, string, string][],
    methodHead: { eyebrow: "LA MÉTHODE", h2: "Audit d’abord. Construction au forfait. Care ensuite." },
    steps: [
      ["01", "Audit IA", "On cartographie ce qui est automatisable, on chiffre le ROI, on écrit une feuille de route. Rien n’est construit à l’aveugle."],
      ["02", "Construction", "Prix fixe, périmètre écrit. RAG sur vos données, garde-fous, évals. Livré à votre nom."],
      ["03", "Care IA", "Mensuel : évals continues, mises à jour des modèles, surveillance des coûts de tokens. L’IA ne dérive pas."],
    ] as [string, string, string][],
    pricingHead: { eyebrow: "TARIFS IA", h2: "Un audit d’abord, un forfait ensuite. Jamais à l’heure." },
    pricingNote: "Montants indicatifs, hors TVA. Coûts de tokens au réel ou plafonnés — affichés, jamais cachés.",
    pricingCta: "En parler",
    plans: [
      {
        name: "Audit IA",
        price: "à partir de 900 €",
        note: "porte d’entrée",
        includes: [
          "Cartographie des tâches automatisables",
          "ROI chiffré, feuille de route",
          "Déduit du projet si vous continuez",
        ],
      },
      {
        name: "Agent mono-tâche",
        price: "à partir de 2 500 €",
        note: "1 à 2 semaines",
        includes: ["Une tâche automatisée de bout en bout", "Garde-fous + jeu d’évals", "Prix fixe, code livré"],
      },
      {
        name: "Assistant RAG",
        price: "à partir de 6 500 €",
        note: "3 à 6 semaines",
        includes: ["Assistant sur vos données, sourcé", "Garde-fous, évals, anti-hallucination", "Multi-modèle, sans lock-in"],
        featured: true,
      },
      {
        name: "Care IA",
        price: "90 €+/mois",
        note: "sans engagement",
        includes: ["Évals continues, mises à jour modèles", "Surveillance des coûts de tokens", "Garde-fous maintenus"],
      },
    ],
    faqHead: { eyebrow: "QUESTIONS FRÉQUENTES", h2: "Ce qu’on nous demande sur l’IA." },
    faq: [
      [
        "Mes données servent-elles à entraîner l’IA ?",
        "Non. Traitement en Europe, zéro rétention côté fournisseur, DPA fourni. Vos données restent les vôtres.",
      ],
      [
        "Et si l’IA invente une réponse ?",
        "L’assistant cite ses sources et répond « je ne sais pas » plutôt que d’inventer. On mesure le taux d’erreur avec des évals avant la mise en ligne.",
      ],
      [
        "Suis-je enfermé chez un fournisseur ?",
        "Non. Modèles interchangeables via une passerelle, prompts et évals à votre nom, export ouvert. Vous pouvez partir.",
      ],
      [
        "Combien coûtent les tokens ?",
        "Variable selon l’usage. On les affiche au réel ou on les plafonne — jamais de coût caché.",
      ],
    ] as [string, string][],
    assistantTeaser: {
      eyebrow: "BIENTÔT — EN DIRECT SUR CE SITE",
      h2: "L’assistant Solive répondra ici même.",
      p: "Un assistant qui répond à partir de ce contenu, cite ses sources, dit « je ne sais pas » quand il ne sait pas, et vous met en relation. La démo, c’est le produit.",
    },
    homeTeaser: {
      eyebrow: "NOUVEAU — IA & AGENTS",
      h2: "Une IA que vous possédez, hébergée en Europe, qui ne raconte pas n’importe quoi.",
      p: "Assistants clients, agents de qualification, automatisations métier. Sourcé, sans lock-in, mesuré. Pas un wrapper ChatGPT de plus.",
      cta: "Découvrir l’offre IA",
    },
  },
  agentChat: {
    launcherLabel: "Discuter avec l’assistant Solive",
    panelTitle: "Assistant Solive",
    consentTitle: "Activer l’assistant IA",
    consentBody:
      "Vos messages sont traités par un modèle de langage pour comprendre votre projet et, si vous le souhaitez, enregistrer votre demande. Révocable à tout moment — voir la",
    consentPrivacyLink: "politique de confidentialité",
    consentAccept: "Activer l’assistant",
    consentDecline: "Pas maintenant",
    placeholder: "Décrivez votre projet…",
    send: "Envoyer",
    thinking: "L’assistant réfléchit…",
    leadCreatedTitle: "Demande enregistrée",
    leadCreatedBody: "Réponse sous 24 h ouvrées.",
    errorGeneric: "Une erreur est survenue. Réessayez, ou écrivez-nous directement.",
    rateLimited: "Trop de messages. Réessayez dans quelques minutes.",
    close: "Fermer",
  },
  contact: {
    labels: {
      name: "Votre nom",
      email: "E-mail",
      company: "Entreprise (facultatif)",
      projectType: "Type de projet",
      message: "Le projet en quelques lignes",
      honeypot: "Ne pas remplir",
    },
    placeholders: {
      name: "Camille Dupont",
      email: "camille@entreprise.be",
      company: "Menuiserie Dupont",
      message: "Ce que vous faites, ce qui coince aujourd'hui, et pour quand vous en avez besoin.",
    },
    submit: "Envoyer la demande",
    sending: "Envoi…",
    orDirect: "Ou directement :",
    errors: {
      nameRequired: "Il manque votre nom.",
      emailInvalid: "Cette adresse e-mail n'a pas l'air valide.",
      messageTooShort: "Décrivez le projet en une phrase ou deux.",
      turnstileMissing: "Merci de valider la vérification anti-spam.",
      rateLimited: (min: number) => `Trop de demandes. Réessayez dans ${min} min.`,
      tooFast: "Envoi trop rapide — réessayez.",
      turnstileFailed: "La vérification anti-spam a échoué. Réessayez.",
      invalid: "Vérifiez les champs et réessayez.",
      generic: "Une erreur est survenue. Réessayez ou écrivez-nous.",
    },
    sent: {
      queuedBadge: "DEMANDE ENREGISTRÉE — HORS LIGNE",
      sentBadge: "DEMANDE ENREGISTRÉE",
      queuedTitle: (firstName: string) => `Merci ${firstName}. Votre demande partira dès que la connexion revient.`,
      sentTitle: (firstName: string) => `Merci ${firstName}. Réponse sous 24 h ouvrées.`,
      queuedBody: "Elle est enregistrée sur votre appareil et s’enverra automatiquement au retour du réseau. Vous pouvez fermer la page.",
      sentBody: "Je reviens vers vous avec deux ou trois questions et une proposition de créneau.",
      again: "Envoyer une autre demande",
    },
    // Display labels only — the stored/emailed value stays the canonical
    // French PROJECT_TYPES string regardless of the visitor's locale, so the
    // admin (always French) never sees mixed-language data.
    projectTypeLabels: {
      "Site vitrine": "Site vitrine",
      "Refonte": "Refonte",
      "Application web": "Application web",
      "Application mobile": "Application mobile",
      "Je ne sais pas encore": "Je ne sais pas encore",
    } as Record<string, string>,
    booking: {
      tabBook: "Réserver un créneau",
      tabMessage: "Écrire un message",
      loading: "Chargement du calendrier…",
      ariaLabel: "Réserver un appel de 20 minutes",
    },
  },
  pageHeaders: {
    services: {
      kicker: "Services",
      title: "Ce qu’on fabrique, de bout en bout.",
      lede: "Du site vitrine à l’application métier, un seul studio conçoit, développe et livre — avec un devis fixe et un calendrier daté.",
    },
    tarifs: {
      kicker: "Tarifs",
      title: "Les ordres de grandeur, avant même de s’appeler.",
      lede: "Un devis fixe pour le périmètre écrit. Pas de rallonge surprise : tout ajout est chiffré à part, et vous décidez.",
    },
    realisations: {
      kicker: "Réalisations",
      title: "Ce que ça donne une fois livré.",
      lede: "Des projets concrets, des résultats mesurés. Cliquez pour le détail de chaque étude de cas.",
    },
    contact: {
      kicker: "Contact",
      title: "Dites-moi ce que vous voulez construire.",
      lede: "Un appel de 20 minutes, un devis fixe, un calendrier daté. Réponse sous 24 h ouvrées.",
    },
    pourquoiSolive: {
      kicker: "Pourquoi Solive",
      title: "Un atelier d’une personne. C’est un choix, pas une contrainte.",
      lede: "Pas de chef de projet, pas de commercial, pas de sous-traitance invisible. Voici ce qu'on défend, ce qu'on sait faire, et pourquoi ça reste ainsi.",
    },
    ia: {
      kicker: "Intelligence artificielle",
      title: "Une IA qui tient debout — pas un wrapper de plus.",
      lede: "Assistants clients, agents de qualification, automatisations métier. Hébergée en Europe, sourcée, mesurée, sans lock-in. Vous la possédez.",
    },
    mentionsLegales: {
      kicker: "Mentions légales",
      title: "Qui édite ce site.",
      lede: "Les informations légales requises, en clair.",
    },
    confidentialite: {
      kicker: "Confidentialité",
      title: "Vos données, traitées avec sobriété.",
      lede: "On ne collecte que ce qui est nécessaire pour répondre à votre demande, on l’héberge en Europe, et vous gardez la main dessus.",
    },
    cookies: {
      kicker: "Cookies & traceurs",
      title: "Le strict nécessaire, rien de plus.",
      lede: "Solive ne dépose aucun cookie publicitaire ni de suivi tiers. Voici précisément ce qui est stocké sur votre appareil, et pourquoi.",
    },
  },
  notFound: {
    kicker: "404",
    title: "Cette page n’existe pas — ou plus.",
    lede: "Le lien est peut-être obsolète, ou l’adresse mal orthographiée. Voici où repartir.",
    cta: "Retour à l’accueil",
  },
  errorPage: {
    title: "Une erreur est survenue.",
    lede: "Quelque chose s’est mal passé de notre côté. L’équipe a été notifiée.",
    retry: "Réessayer",
    home: "Retour à l’accueil",
  },
  pricingReassurance: {
    eyebrow: "CE QUE « PRIX FIXE » VEUT DIRE",
    h2: "Un forfait, sans mauvaise surprise.",
    points: [
      ["Périmètre écrit", "Ce qui est inclus est noté noir sur blanc avant de commencer. On sait tous les deux où on va."],
      ["Pas de rallonge surprise", "Le prix ne bouge pas pour le périmètre convenu. Tout ajout est chiffré à part, et c’est vous qui décidez."],
      ["Calendrier daté", "Une date de livraison, des jalons visibles. Vous savez toujours où on en est."],
      ["Le code est à vous", "Livré à votre nom, hébergé en Europe. Pas de dépendance, pas de rançon technique."],
    ] as [string, string][],
  },
  contactCta: {
    defaultTitle: "Un projet en tête ?",
    defaultText: "Un appel de 20 minutes, un devis fixe et un calendrier daté. Sans engagement.",
    button: "Parler du projet",
    ia: {
      title: "Un cas d’usage IA en tête ?",
      text: "On commence par un audit court : ce qui est automatisable chez vous, le ROI, la feuille de route. Puis un devis fixe.",
    },
  },
  caseStudy: {
    client: "Client",
    result: "Résultat",
    stack: "Stack",
    emptyBody: "Étude de cas détaillée en cours de rédaction. En attendant, parlons de votre projet — je vous montre des exemples proches lors de l’appel.",
    backToList: "← Toutes les réalisations",
  },
  home: {
    mediaBandCaption: "Un atelier, pas une agence. Vous parlez à qui code.",
  },
  iaPage: {
    mediaBandCaption: "Des évals, pas de la magie. On mesure le taux d’erreur avant de livrer.",
  },
  meta: {
    root: {
      title: "Solive — studio de développement à Charleroi",
      description:
        "Studio de développement à Charleroi : sites vitrines, applications web métier et applications mobiles. Devis fixe, calendrier daté, code livré à votre nom.",
    },
    services: {
      title: "Services — sites, applications web & mobiles",
      description:
        "Sites vitrines et refontes, applications web métier sur mesure, applications mobiles iOS et Android. Une méthode en quatre étapes, un devis fixe.",
    },
    tarifs: {
      title: "Tarifs — devis fixe, calendrier daté",
      description:
        "Les ordres de grandeur avant même de s’appeler : site vitrine, application web, application mobile. Devis fixe, sans rallonge.",
    },
    realisations: {
      title: "Réalisations — études de cas",
      description:
        "Sites, outils métier et applications mobiles livrés pour des artisans, PME et startups en Belgique, France et Luxembourg.",
    },
    contact: {
      title: "Contact — parlons de votre projet",
      description:
        "Décrivez votre projet en quelques lignes. Réponse sous 24 h ouvrées, avec des questions et une proposition de créneau.",
    },
    pourquoiSolive: {
      title: "Pourquoi Solive",
      description:
        "Un atelier d'une personne, par choix. Ce que Solive défend, ce qu'on sait faire, et pourquoi rester petit garde la relation honnête.",
    },
    ia: {
      title: "IA & agents — assistants souverains, sans lock-in",
      description:
        "Assistants clients, agents de qualification et automatisations métier. Une IA hébergée en Europe, sourcée, mesurée, que vous possédez — pas un wrapper ChatGPT de plus.",
    },
    mentionsLegales: {
      title: "Mentions légales",
      description: "Informations légales de Solive : éditeur, hébergement, propriété intellectuelle et règlement des litiges.",
    },
    confidentialite: {
      title: "Politique de confidentialité",
      description:
        "Comment Solive traite vos données personnelles : finalités, bases légales, sous-traitants européens, durées de conservation et vos droits RGPD.",
    },
    cookies: {
      title: "Cookies & traceurs",
      description: "Ce que Solive stocke sur votre appareil : uniquement l’essentiel, aucun traceur publicitaire. Détail des finalités et durées.",
    },
  },
  legal: {
    subprocessors: [
      ["Supabase (base de données, authentification)", "Union européenne", "Hébergement du contenu et des demandes"],
      ["Vercel (hébergement applicatif)", "Union européenne", "Diffusion du site"],
      ["Brevo (envoi d’e-mails)", "Union européenne", "Notification et accusé de réception des demandes"],
      ["Cloudflare Turnstile (anti-spam)", "UE / traitement sans cookie tiers", "Protection du formulaire de contact"],
      ["Upstash (limitation de débit)", "Union européenne", "Prévention des abus du formulaire"],
    ] as [string, string, string][],
    subprocessorsColumns: ["Prestataire", "Localisation", "Rôle"],
    cookieRows: [
      ["solive-consent", "localStorage", "Mémoriser votre choix de consentement", "Jusqu’à effacement"],
      [
        "Session admin (Supabase)",
        "Cookie strictement nécessaire",
        "Garder l’administrateur connecté (espace /admin uniquement)",
        "Durée de session",
      ],
      [
        "Turnstile (Cloudflare)",
        "Cookie strictement nécessaire",
        "Anti-spam du formulaire de contact, au moment de l’envoi",
        "Le temps de la vérification",
      ],
      [
        "Cache hors-ligne (PWA)",
        "Service worker / Cache API",
        "Consultation hors-ligne du site public",
        "Jusqu’à mise à jour ou effacement",
      ],
    ] as [string, string, string, string][],
    cookieColumns: ["Nom", "Type", "Finalité", "Durée"],
    seeAlso: "Voir aussi la",
    and: "et les",
    linkLabels: {
      confidentialite: "confidentialité",
      confidentialiteFull: "politique de confidentialité",
      cookies: "cookies",
      cookiesFull: "politique cookies",
      mentionsLegales: "mentions légales",
    },
    updatedOn: (date: string) => `Dernière mise à jour : ${date}.`,
  },
  legalPages: {
    mentionsLegales: {
      editeurHeading: "Éditeur",
      editeurStudio: (name: string) => `${name}, studio de développement.`,
      editeurSiege: (address: string) => `Siège : ${address}.`,
      editeurTel: (phone: string) => `Téléphone : ${phone}.`,
      editeurContact: "Contact :",
      editeurVat: (vat: string) => `N° de TVA : ${vat}.`,
      editeurForme: "Forme juridique et numéro d’entreprise (BCE) : [À COMPLÉTER].",
      directeurHeading: "Directeur de la publication",
      directeurText: (name: string) => `Le représentant légal de ${name}. [À COMPLÉTER].`,
      hebergementHeading: "Hébergement",
      hebergementText:
        "Site hébergé par Vercel et Supabase, sur une infrastructure située dans l’Union européenne.",
      proprieteHeading: "Propriété intellectuelle",
      proprieteText: (name: string) =>
        `Les textes, la charte graphique et le code de ce site sont la propriété de ${name}, sauf mention contraire. Le code livré dans le cadre d’un projet client appartient au client, comme indiqué dans le devis. Toute reproduction non autorisée du présent site est interdite.`,
      responsabiliteHeading: "Responsabilité",
      responsabiliteText: (name: string) =>
        `${name} s’efforce d’assurer l’exactitude des informations publiées, sans garantie d’exhaustivité. Les liens externes n’engagent pas notre responsabilité.`,
      litigesHeading: "Règlement des litiges",
      litigesIntro:
        "En cas de litige, une solution amiable sera recherchée en priorité. La plateforme européenne de règlement en ligne des litiges est accessible à",
      litigesOutro: ". Le droit belge est applicable.",
    },
    cookies: {
      audienceHeading: "Une mesure d’audience anonyme, sans cookie",
      audienceP1:
        "On mesure l’audience du site pour l’améliorer et évaluer nos campagnes, mais sans cookie et sans donnée personnelle. Concrètement : la page vue, le pays (à la maille du pays), l’appareil (mobile/ordinateur), le site référent et les paramètres de campagne (utm_*) sont enregistrés de façon agrégée. Aucune adresse IP n’est conservée — elle sert uniquement à calculer une empreinte à sens unique qui change chaque jour, ce qui permet de compter les visiteurs sans jamais les identifier ni les suivre d’un jour à l’autre.",
      audienceP2:
        "Ces données restent chez nous, hébergées en Europe, et ne sont partagées avec aucune régie publicitaire. Vous n’en voulez pas ? Cliquez « Refuser le non-essentiel » dans le bandeau — la mesure est alors désactivée pour vous. Les signaux navigateur « Do Not Track » et « Global Privacy Control » sont également respectés.",
      usedHeading: "Ce qui est réellement utilisé",
      revertHeading: "Revenir sur votre choix",
      revertText:
        "Votre décision est conservée localement (clé solive-consent). Pour la réinitialiser, effacez les données du site dans votre navigateur : le bandeau réapparaîtra au prochain chargement.",
    },
  },
  admin: {
    brandBadge: "Admin",
    nav: {
      aria: "Navigation admin",
      groups: {
        pilotage: "Pilotage",
        contenu: "Contenu",
        relationClient: "Relation client",
        systeme: "Système",
      },
      items: {
        dashboard: "Tableau de bord",
        statistiques: "Statistiques",
        sections: "Sections",
        collections: "Collections",
        confidentialite: "Confidentialité (RGPD)",
        demandes: "Demandes",
        devis: "Devis",
        parametres: "Paramètres",
        utilisateurs: "Utilisateurs",
        journal: "Journal",
        profil: "Profil",
      },
    },
    topbar: {
      openMenu: "Ouvrir le menu",
      closeMenu: "Fermer le menu",
      viewSite: "Voir le site",
      defaultTitle: "Administration",
    },
    account: {
      signOut: "Déconnexion",
      roleOwner: "Propriétaire",
      roleEditor: "Éditeur",
    },
    profile: {
      title: "Profil",
      accountHeading: "Compte",
      fullNameLabel: "Nom complet",
      emailLabel: "E-mail",
      roleLabel: "Rôle",
      mfaLabel: "Authentification à deux facteurs",
      mfaEnabled: "Activée",
      mfaDisabled: "Non activée",
      lastSeenLabel: "Dernière connexion",
      never: "Jamais",
      saveButton: "Enregistrer",
      saving: "Enregistrement…",
      saved: "Modifications enregistrées.",
      saveError: "Une erreur est survenue.",
      passwordHeading: "Mot de passe",
      passwordText: "Recevez un lien par e-mail pour définir un nouveau mot de passe.",
      passwordButton: "Envoyer le lien de réinitialisation",
      passwordSending: "Envoi…",
      passwordSent: "Lien envoyé. Vérifiez votre boîte mail.",
      languageHeading: "Langue du tableau de bord",
      languageText: "Choisissez la langue utilisée pour l’interface d’administration.",
    },
    legalEditor: {
      title: "Confidentialité (RGPD)",
      description: "Contenu de la page publique /confidentialite, en français et en anglais.",
      tabFr: "Français",
      tabEn: "English",
      introLabel: "Introduction — sections 1 à 4",
      suiteLabel: "Suite — sections 5 à 8",
      subprocessorsNotice:
        "Le tableau des sous-traitants s’affiche ici publiquement, entre les deux blocs ci-dessous. Il n’est pas éditable depuis cet écran.",
      saveButton: "Enregistrer",
      saving: "Enregistrement…",
      saved: "Enregistré.",
      saveError: "Échec — réessayer.",
      unsavedChanges: "Modifications non enregistrées.",
      conflict:
        "Ce contenu a été modifié ailleurs entre-temps. Rechargez la page avant de continuer.",
    },
  },
};

export type FrDictionary = typeof fr;
