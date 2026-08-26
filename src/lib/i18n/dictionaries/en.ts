import type { fr } from "./fr";

export const en = {
  common: {
    skipLink: "Skip to content",
    switchToFr: "Passer en français",
    switchToEn: "Switch to English",
    baseline: "dev studio",
    ville: "Charleroi",
  },
  nav: {
    links: {
      home: "Home",
      services: "Services",
      ia: "AI",
      realisations: "Work",
      pourquoiSolive: "Why Solive",
      tarifs: "Pricing",
    },
    cta: "Talk about your project",
    ariaMain: "Main navigation",
    ariaMenuOpen: "Open menu",
    ariaMenuClose: "Close menu",
    brandAria: (brand: string) => `${brand}, home`,
  },
  footer: {
    pourquoi:
      "A solive is the beam you never see, the one the whole floor rests on. We build strong.",
    belgique: "Belgium",
    contact: "Contact",
    formulaire: "Form",
    legal: "Legal",
    mentionsLegales: "Legal notice",
    confidentialite: "Privacy",
    cookies: "Cookies",
    tva: (vat: string) => `VAT ${vat}`,
    faitA: (ville: string) => `Made in ${ville}. Hosted in Europe.`,
  },
  hero: {
    lede: "Showcase sites, business tools, mobile apps. For tradespeople, SMEs and startups in Belgium, France and Luxembourg. Fixed quote, dated schedule, code delivered in your name.",
    ctaPrimary: "Take 20 minutes",
    ctaSecondary: "See how we work",
    facts: ["4 to 6 weeks for a website", "Fixed price, no add-ons", "You keep the code"],
    buildStrong: "BUILD STRONG",
  },
  ticker: {
    items: [
      "Next.js",
      "TypeScript",
      "React Native",
      "Supabase",
      "AI agents",
      "RAG",
      "Mistral / Llama",
      "Evals & guardrails",
      "Stripe",
      "Tailwind",
      "Vercel",
      "Technical SEO",
      "E-invoicing 2026",
      "GDPR & AI Act",
    ],
  },
  sectionsFallback: {
    services: { kicker: "What we build", titre: "Three offerings, one point of contact." },
    methode: { kicker: "The method", titre: "Four steps. You always know where things stand." },
    travaux: { kicker: "Work", titre: "What it looks like once delivered." },
    tarifs: { kicker: "Pricing", titre: "The ballpark figures, before we even talk." },
    temoignages: { kicker: "What people say", titre: "What the people I've delivered for say." },
    faq: { kicker: "Questions", titre: "What people ask before signing." },
  },
  services: {
    caseStudyAria: (title: string) => `View case study: ${title}`,
  },
  pricing: {
    mostRequested: "Most requested",
    requestQuote: "Request a quote",
    maintenanceNote: "Maintenance, hosting and small changes: €90 / month, no commitment. Prices exclude VAT.",
  },
  testimonialsWall: {
    starsAria: (n: number) => `${n} out of 5`,
    pause: "❚❚ Pause",
    resume: "▶ Resume scrolling",
    caseStudyAria: (author: string) => `Case study related to ${author}'s review`,
  },
  planCycle: {
    typeAria: "Project type",
    planLabel: (n: number) => `PLAN ${String(n).padStart(2, "0")}/03`,
    schemaAria: (label: string) => `Diagram: ${label}`,
    plans: {
      vitrine: {
        label: "Showcase site",
        cote: "homepage — 1.2s load time",
        annot: "technical SEO",
      },
      app: {
        label: "Web application",
        cote: "dashboard — your business rules",
        annot: "accounts + roles",
      },
      mobile: {
        label: "Mobile application",
        cote: "iOS + Android — one shared codebase",
        annot: "offline",
      },
    },
  },
  floatCta: { label: "Take 20 minutes" },
  scrollTop: { ariaLabel: "Back to top" },
  consentBanner: {
    ariaLabel: "Cookie consent",
    textBold: "We respect your privacy.",
    textRest: " This site drops no tracking cookies. We measure audience anonymously — no cookies, no personal data — and you can opt out in one click.",
    learnMore: "Learn more",
    refuse: "Reject non-essential",
    acceptAll: "Accept all",
  },
  networkStatus: {
    offline: "Offline — your actions are saved",
    pending: (n: number) => `${n} request${n > 1 ? "s" : ""} waiting to send`,
  },
  swUpdate: {
    available: "A new version is available.",
    reload: "Reload",
    later: "Later",
  },
  whySolive: {
    values: [
      [
        "Fixed price, said once",
        "The quote covers what's written down. No surprise line at the end, no \"it depends\" on every question.",
      ],
      [
        "The code is yours",
        "Delivered in your name, on your accounts. You can walk away with it — and being able to walk away is exactly what keeps the relationship honest.",
      ],
      [
        "Hosted in Europe",
        "Your data and your clients' data stay under European law. Not a detail: a choice.",
      ],
      [
        "We measure, we don't promise",
        "A load time, an AI assistant's error rate, a delivery date: verifiable numbers, not talking points.",
      ],
      [
        "Direct, no salesperson",
        "The person who answers the scoping call is the one who writes the code. Nothing gets lost in translation.",
      ],
      [
        "Scope before the keyboard",
        "Written scope, validated mockups, then development. You know what you're getting before a line of code is written.",
      ],
    ] as [string, string][],
    valuesHead: { eyebrow: "WHAT WE STAND FOR", h2: "Principles, not talking points." },
    skills: [
      ["Web & mobile", ["Next.js", "TypeScript", "React Native", "Tailwind"]],
      ["Data & infra", ["Supabase", "PostgreSQL", "Vercel", "Stripe"]],
      ["AI & agents", ["RAG", "Mistral / Llama", "Evals & guardrails", "AI Gateway"]],
    ] as [string, string[]][],
    skillsHead: {
      eyebrow: "WHAT WE KNOW HOW TO DO",
      h2: "A tight stack, kept current — not a hundred half-mastered technologies.",
    },
    founder: {
      eyebrow: "THE PERSON BEHIND SOLIVE",
      p1: "Solive is a one-person workshop, by choice. No project manager between you and the code, no salesperson pricing what they won't build. Scoping, development, launch and the morning coffee: the same person, from the first call to delivery.",
      p2: "It's a choice about size, not a lack of resources: staying small to stay direct, measuring what's delivered instead of overselling it, and only taking on projects that can be honored with a fixed quote.",
    },
    vision: {
      eyebrow: "THE VISION",
      h2: "Staying a workshop, even while growing.",
      p1: "The development market is full of generic promises — \"we do AI\", \"we ship fast\", \"we're experts\". Solive starts from the opposite principle: say less, but keep it. A fixed quote that doesn't move. A dated schedule that holds. An AI that cites its sources instead of making things up. Code you actually own, not rent.",
      p2: "As Solive grows, the goal isn't to become another agency, but to stay the workshop where you can still call the person who wrote your code directly — and to expand what we know how to do (particularly applied AI for real businesses) without ever losing that closeness.",
      cta: "Talk about it directly",
    },
  },
  ia: {
    serviceType: "Artificial intelligence — assistants and agents",
    jsonLdDescription:
      "AI assistants (RAG), qualification agents, business automation. Hosted in Europe, no lock-in, guardrails and evals.",
    diffsHead: {
      eyebrow: "WHAT SETS US APART",
      h2: "Everyone plugs in a chatbot. Few deliver an AI that actually holds up.",
    },
    diffs: [
      [
        "Data sovereignty",
        "Sent to US servers, reused for training.",
        "Processed in Europe, zero retention, DPA provided. Your data stays yours.",
      ],
      [
        "Zero lock-in",
        "Locked into one vendor, impossible to leave.",
        "Interchangeable models, prompts and evals in your name, open export.",
      ],
      [
        "Guardrails & evals",
        "A demo that hallucinates once it's in production.",
        "Tested, measured, bounded: PII/injection guardrails, error rate measured before launch.",
      ],
      [
        "Grounded in your business",
        "A generic chatbot disconnected from your business.",
        "RAG on your documents, wired into your tools (invoicing, calendar, CRM).",
      ],
      [
        "Sourced answers",
        "Confidently makes up an answer.",
        "Cites its sources and says \"I don't know\" instead of making things up.",
      ],
      [
        "Price & outcome",
        "Billed by the hour, fuzzy scope.",
        "Fixed quote, audit first, measured outcome (hours saved).",
      ],
    ] as [string, string, string][],
    useCasesHead: { eyebrow: "WHAT WE BUILD", h2: "Assistants and agents grounded in your business." },
    useCases: [
      [
        "Client assistant (RAG)",
        "Answers your clients from your own documents. 24/7 support and FAQ, every answer sourced.",
        "/images/code-screen.jpg",
      ],
      [
        "Qualification agent",
        "Qualifies your leads, replies at night, suggests a time slot. You get requests ready to work.",
        "/images/mobile-app.jpg",
      ],
      [
        "Internal copilot",
        "Searches your documents, summarizes, drafts. Your teams save hours.",
        "/images/code-macro.jpg",
      ],
      [
        "Business automation",
        "Email sorting, PDF and invoice extraction, data entry avoided. The AI does the chore, not you.",
        "/images/circuit.jpg",
      ],
      [
        "E-invoicing 2026",
        "Factur-X / Peppol extraction and validation, ready for the mandate arriving in 2026–2027.",
        "/images/dev-desk.jpg",
      ],
      [
        "AI search (GEO)",
        "Be found and cited by generative search engines, not just ranked by Google.",
        "/images/server.jpg",
      ],
    ] as [string, string, string][],
    methodHead: { eyebrow: "THE METHOD", h2: "Audit first. Fixed-price build. Care after." },
    steps: [
      ["01", "AI audit", "We map what's automatable, cost out the ROI, and write a roadmap. Nothing gets built blind."],
      ["02", "Build", "Fixed price, written scope. RAG on your data, guardrails, evals. Delivered in your name."],
      ["03", "AI care", "Monthly: ongoing evals, model updates, token-cost monitoring. The AI doesn't drift."],
    ] as [string, string, string][],
    pricingHead: { eyebrow: "AI PRICING", h2: "An audit first, then a fixed price. Never by the hour." },
    pricingNote: "Indicative amounts, excluding VAT. Token costs at actuals or capped — shown, never hidden.",
    pricingCta: "Talk about it",
    plans: [
      {
        name: "AI audit",
        price: "from €900",
        note: "the entry point",
        includes: [
          "Mapping of automatable tasks",
          "Costed ROI, roadmap",
          "Deducted from the project if you continue",
        ],
      },
      {
        name: "Single-task agent",
        price: "from €2,500",
        note: "1 to 2 weeks",
        includes: ["One task automated end-to-end", "Guardrails + eval suite", "Fixed price, code delivered"],
      },
      {
        name: "RAG assistant",
        price: "from €6,500",
        note: "3 to 6 weeks",
        includes: ["Assistant on your own data, sourced", "Guardrails, evals, anti-hallucination", "Multi-model, no lock-in"],
        featured: true,
      },
      {
        name: "AI care",
        price: "€90+/month",
        note: "no commitment",
        includes: ["Ongoing evals, model updates", "Token-cost monitoring", "Guardrails maintained"],
      },
    ],
    faqHead: { eyebrow: "FREQUENTLY ASKED QUESTIONS", h2: "What people ask about AI." },
    faq: [
      [
        "Does my data train the AI?",
        "No. Processed in Europe, zero retention on the provider's side, DPA provided. Your data stays yours.",
      ],
      [
        "What if the AI makes something up?",
        "The assistant cites its sources and answers \"I don't know\" instead of making things up. We measure the error rate with evals before launch.",
      ],
      [
        "Am I locked into a vendor?",
        "No. Interchangeable models via a gateway, prompts and evals in your name, open export. You can leave.",
      ],
      [
        "How much do tokens cost?",
        "Varies by usage. We show them at actuals or cap them — never a hidden cost.",
      ],
    ] as [string, string][],
    assistantTeaser: {
      eyebrow: "COMING SOON — LIVE ON THIS SITE",
      h2: "The Solive assistant will answer right here.",
      p: "An assistant that answers from this content, cites its sources, says \"I don't know\" when it doesn't, and puts you in touch. The demo is the product.",
    },
    homeTeaser: {
      eyebrow: "NEW — AI & AGENTS",
      h2: "AI you own, hosted in Europe, that doesn't make things up.",
      p: "Client assistants, qualification agents, business automation. Sourced, no lock-in, measured. Not another ChatGPT wrapper.",
      cta: "Discover the AI offering",
    },
  },
  contact: {
    labels: {
      name: "Your name",
      email: "Email",
      company: "Company (optional)",
      projectType: "Project type",
      message: "The project in a few lines",
      honeypot: "Leave this empty",
    },
    placeholders: {
      name: "Camille Dupont",
      email: "camille@company.com",
      company: "Dupont Woodworks",
      message: "What you do, what's stuck today, and when you need this by.",
    },
    submit: "Send the request",
    sending: "Sending…",
    orDirect: "Or directly:",
    errors: {
      nameRequired: "Your name is missing.",
      emailInvalid: "That email address doesn't look valid.",
      messageTooShort: "Describe the project in a sentence or two.",
      turnstileMissing: "Please complete the anti-spam check.",
      rateLimited: (min: number) => `Too many requests. Try again in ${min} min.`,
      tooFast: "Sent too fast — try again.",
      turnstileFailed: "The anti-spam check failed. Try again.",
      invalid: "Check the fields and try again.",
      generic: "Something went wrong. Try again or email us directly.",
    },
    sent: {
      queuedBadge: "REQUEST SAVED — OFFLINE",
      sentBadge: "REQUEST SAVED",
      queuedTitle: (firstName: string) => `Thanks ${firstName}. Your request will send as soon as you're back online.`,
      sentTitle: (firstName: string) => `Thanks ${firstName}. Reply within 24 business hours.`,
      queuedBody: "It's saved on your device and will send automatically once the connection is back. You can close this page.",
      sentBody: "I'll get back to you with a couple of questions and a proposed time slot.",
      again: "Send another request",
    },
    projectTypeLabels: {
      "Site vitrine": "Showcase site",
      "Refonte": "Redesign",
      "Application web": "Web application",
      "Application mobile": "Mobile application",
      "Je ne sais pas encore": "Not sure yet",
    } as Record<string, string>,
  },
  pageHeaders: {
    services: {
      kicker: "Services",
      title: "What we build, end to end.",
      lede: "From showcase site to business application, one studio designs, builds and delivers — with a fixed quote and a dated schedule.",
    },
    tarifs: {
      kicker: "Pricing",
      title: "The ballpark figures, before we even talk.",
      lede: "A fixed quote for the written scope. No surprise add-ons: anything extra is priced separately, and you decide.",
    },
    realisations: {
      kicker: "Work",
      title: "What it looks like once delivered.",
      lede: "Real projects, measured results. Click through for the detail of each case study.",
    },
    contact: {
      kicker: "Contact",
      title: "Tell me what you want to build.",
      lede: "A 20-minute call, a fixed quote, a dated schedule. Reply within 24 business hours.",
    },
    pourquoiSolive: {
      kicker: "Why Solive",
      title: "A one-person workshop. A choice, not a constraint.",
      lede: "No project manager, no salesperson, no invisible subcontracting. Here's what we stand for, what we know how to do, and why it stays that way.",
    },
    ia: {
      kicker: "Artificial intelligence",
      title: "AI that actually holds up — not another wrapper.",
      lede: "Client assistants, qualification agents, business automation. Hosted in Europe, sourced, measured, no lock-in. You own it.",
    },
    mentionsLegales: {
      kicker: "Legal notice",
      title: "Who publishes this site.",
      lede: "The required legal information, in plain terms.",
    },
    confidentialite: {
      kicker: "Privacy",
      title: "Your data, handled sparingly.",
      lede: "We only collect what's needed to respond to your request, host it in Europe, and you stay in control of it.",
    },
    cookies: {
      kicker: "Cookies & trackers",
      title: "The strict minimum, nothing more.",
      lede: "Solive drops no advertising or third-party tracking cookies. Here's precisely what's stored on your device, and why.",
    },
  },
  pricingReassurance: {
    eyebrow: "WHAT \"FIXED PRICE\" ACTUALLY MEANS",
    h2: "A flat fee, no bad surprises.",
    points: [
      ["Written scope", "What's included is put in writing before we start. We both know where we're headed."],
      ["No surprise add-ons", "The price doesn't move for the agreed scope. Any extra is priced separately, and you decide."],
      ["Dated schedule", "A delivery date, visible milestones. You always know where things stand."],
      ["The code is yours", "Delivered in your name, hosted in Europe. No dependency, no technical ransom."],
    ] as [string, string][],
  },
  contactCta: {
    defaultTitle: "Got a project in mind?",
    defaultText: "A 20-minute call, a fixed quote and a dated schedule. No commitment.",
    button: "Talk about your project",
    ia: {
      title: "Got an AI use case in mind?",
      text: "We start with a short audit: what's automatable in your business, the ROI, the roadmap. Then a fixed quote.",
    },
  },
  caseStudy: {
    client: "Client",
    result: "Result",
    stack: "Stack",
    emptyBody: "Detailed case study in progress. In the meantime, let's talk about your project — I'll show you similar examples on the call.",
    backToList: "← All case studies",
  },
  home: {
    mediaBandCaption: "A workshop, not an agency. You talk to whoever writes the code.",
  },
  iaPage: {
    mediaBandCaption: "Evals, not magic. We measure the error rate before shipping.",
  },
  meta: {
    root: {
      title: "Solive — dev studio in Charleroi",
      description:
        "Dev studio in Charleroi: showcase sites, business web applications and mobile apps. Fixed quote, dated schedule, code delivered in your name.",
    },
    services: {
      title: "Services — websites, web & mobile apps",
      description:
        "Showcase sites and redesigns, tailor-made business web apps, iOS and Android mobile apps. A four-step method, a fixed quote.",
    },
    tarifs: {
      title: "Pricing — fixed quote, dated schedule",
      description:
        "The ballpark figures before we even talk: showcase site, web application, mobile application. Fixed quote, no add-ons.",
    },
    realisations: {
      title: "Work — case studies",
      description:
        "Sites, business tools and mobile apps delivered for tradespeople, SMEs and startups in Belgium, France and Luxembourg.",
    },
    contact: {
      title: "Contact — let's talk about your project",
      description:
        "Describe your project in a few lines. Reply within 24 business hours, with questions and a proposed time slot.",
    },
    pourquoiSolive: {
      title: "Why Solive",
      description:
        "A one-person workshop, by choice. What Solive stands for, what we know how to do, and why staying small keeps the relationship honest.",
    },
    ia: {
      title: "AI & agents — sovereign assistants, no lock-in",
      description:
        "Client assistants, qualification agents and business automation. AI hosted in Europe, sourced, measured, that you own — not another ChatGPT wrapper.",
    },
    mentionsLegales: {
      title: "Legal notice",
      description: "Solive's legal information: publisher, hosting, intellectual property and dispute resolution.",
    },
    confidentialite: {
      title: "Privacy policy",
      description:
        "How Solive handles your personal data: purposes, legal bases, European subprocessors, retention periods and your GDPR rights.",
    },
    cookies: {
      title: "Cookies & trackers",
      description: "What Solive stores on your device: only the essentials, no advertising trackers. Purposes and durations in detail.",
    },
  },
  legal: {
    subprocessors: [
      ["Supabase (database, authentication)", "European Union", "Hosting content and requests"],
      ["Vercel (application hosting)", "European Union", "Serving the site"],
      ["Brevo (email delivery)", "European Union", "Notification and acknowledgment of requests"],
      ["Cloudflare Turnstile (anti-spam)", "EU / no third-party cookie processing", "Contact form protection"],
      ["Upstash (rate limiting)", "European Union", "Preventing form abuse"],
    ] as [string, string, string][],
    subprocessorsColumns: ["Provider", "Location", "Role"],
    cookieRows: [
      ["solive-consent", "localStorage", "Remembers your consent choice", "Until cleared"],
      [
        "Admin session (Supabase)",
        "Strictly necessary cookie",
        "Keeps the administrator signed in (/admin area only)",
        "Session duration",
      ],
      [
        "Turnstile (Cloudflare)",
        "Strictly necessary cookie",
        "Contact form anti-spam, at submission time",
        "Length of the check",
      ],
      [
        "Offline cache (PWA)",
        "Service worker / Cache API",
        "Offline browsing of the public site",
        "Until updated or cleared",
      ],
    ] as [string, string, string, string][],
    cookieColumns: ["Name", "Type", "Purpose", "Duration"],
    seeAlso: "See also our",
    and: "and our",
    linkLabels: {
      confidentialite: "privacy",
      confidentialiteFull: "privacy policy",
      cookies: "cookies",
      cookiesFull: "cookie policy",
      mentionsLegales: "legal notice",
    },
    updatedOn: (date: string) => `Last updated: ${date}.`,
  },
  legalPages: {
    mentionsLegales: {
      editeurHeading: "Publisher",
      editeurStudio: (name: string) => `${name}, dev studio.`,
      editeurSiege: (address: string) => `Registered office: ${address}.`,
      editeurTel: (phone: string) => `Phone: ${phone}.`,
      editeurContact: "Contact:",
      editeurVat: (vat: string) => `VAT number: ${vat}.`,
      editeurForme: "Legal form and business registration number (BCE): [TO BE COMPLETED].",
      directeurHeading: "Publication director",
      directeurText: (name: string) => `The legal representative of ${name}. [TO BE COMPLETED].`,
      hebergementHeading: "Hosting",
      hebergementText: "Site hosted by Vercel and Supabase, on infrastructure located in the European Union.",
      proprieteHeading: "Intellectual property",
      proprieteText: (name: string) =>
        `The text, visual identity and code of this site are the property of ${name}, unless stated otherwise. Code delivered as part of a client project belongs to the client, as set out in the quote. Any unauthorized reproduction of this site is prohibited.`,
      responsabiliteHeading: "Liability",
      responsabiliteText: (name: string) =>
        `${name} strives to ensure the accuracy of the information published, without guaranteeing completeness. External links are not our responsibility.`,
      litigesHeading: "Dispute resolution",
      litigesIntro:
        "In the event of a dispute, an amicable solution will be sought first. The European online dispute resolution platform is available at",
      litigesOutro: ". Belgian law applies.",
    },
    cookies: {
      audienceHeading: "Anonymous, cookie-free audience measurement",
      audienceP1:
        "We measure the site's audience to improve it and evaluate our campaigns, but with no cookies and no personal data. Specifically: the page viewed, the country (at country granularity), the device (mobile/desktop), the referring site and campaign parameters (utm_*) are recorded in aggregate. No IP address is retained — it's only used to compute a one-way fingerprint that changes every day, which lets us count visitors without ever identifying or tracking them from one day to the next.",
      audienceP2:
        "This data stays with us, hosted in Europe, and is never shared with any advertising network. Don't want it? Click \"Reject non-essential\" in the banner — measurement is then disabled for you. Browser \"Do Not Track\" and \"Global Privacy Control\" signals are also respected.",
      usedHeading: "What's actually used",
      revertHeading: "Changing your choice",
      revertText:
        "Your decision is stored locally (key solive-consent). To reset it, clear the site's data in your browser: the banner will reappear on the next load.",
    },
  },
  admin: {
    brandBadge: "Admin",
    nav: {
      aria: "Admin navigation",
      groups: {
        pilotage: "Overview",
        contenu: "Content",
        relationClient: "Client relations",
        systeme: "System",
      },
      items: {
        dashboard: "Dashboard",
        statistiques: "Statistics",
        sections: "Sections",
        collections: "Collections",
        confidentialite: "Privacy (GDPR)",
        demandes: "Requests",
        devis: "Quotes",
        parametres: "Settings",
        utilisateurs: "Users",
        journal: "Log",
        profil: "Profile",
      },
    },
    topbar: {
      openMenu: "Open menu",
      closeMenu: "Close menu",
      viewSite: "View site",
      defaultTitle: "Administration",
    },
    account: {
      signOut: "Sign out",
      roleOwner: "Owner",
      roleEditor: "Editor",
    },
    profile: {
      title: "Profile",
      accountHeading: "Account",
      fullNameLabel: "Full name",
      emailLabel: "Email",
      roleLabel: "Role",
      mfaLabel: "Two-factor authentication",
      mfaEnabled: "Enabled",
      mfaDisabled: "Not enabled",
      lastSeenLabel: "Last seen",
      never: "Never",
      saveButton: "Save",
      saving: "Saving…",
      saved: "Changes saved.",
      saveError: "Something went wrong.",
      passwordHeading: "Password",
      passwordText: "Get an email link to set a new password.",
      passwordButton: "Send reset link",
      passwordSending: "Sending…",
      passwordSent: "Link sent. Check your inbox.",
      languageHeading: "Dashboard language",
      languageText: "Choose the language used for the admin interface.",
    },
    legalEditor: {
      title: "Privacy (GDPR)",
      description: "Content of the public /confidentialite page, in French and English.",
      tabFr: "Français",
      tabEn: "English",
      introLabel: "Introduction — sections 1 to 4",
      suiteLabel: "Continued — sections 5 to 8",
      subprocessorsNotice:
        "The subprocessors table is rendered publicly here, between the two blocks below. It isn't editable from this screen.",
      saveButton: "Save",
      saving: "Saving…",
      saved: "Saved.",
      saveError: "Failed — try again.",
      unsavedChanges: "Unsaved changes.",
      conflict: "This content was changed elsewhere in the meantime. Reload the page before continuing.",
    },
  },
} satisfies typeof fr;
