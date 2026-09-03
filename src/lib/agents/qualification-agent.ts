import "server-only";
import { createAnthropic } from "@ai-sdk/anthropic";
import { stepCountIs, ToolLoopAgent, type InferAgentUIMessage } from "ai";
import { env } from "@/lib/env";
import { tiptapToText } from "@/lib/tiptap/render";
import { createLeadTool } from "@/lib/tools/create-lead-tool";
import {
  getFaqItems,
  getPricingPlans,
  getProcessSteps,
  getServices,
} from "@/server/queries/content";
import { getAgentRuntimeConfig } from "@/server/services/agent-settings";

const DEFAULT_MODEL = "claude-haiku-4-5";

async function buildSiteContext(locale: "fr" | "en"): Promise<string> {
  const [services, plans, steps, faq] = await Promise.all([
    getServices(locale),
    getPricingPlans(locale),
    getProcessSteps(locale),
    getFaqItems(locale),
  ]);

  const servicesText = services
    .map((s) => `- ${s.title}${s.summary ? `: ${s.summary}` : ""}`)
    .join("\n");
  const plansText = plans
    .map(
      (p) =>
        `- ${p.name}${p.priceLabel ? ` (${p.priceLabel}${p.priceNote ? `, ${p.priceNote}` : ""})` : ""}: ${p.includes.join(", ")}`,
    )
    .join("\n");
  const stepsText = steps
    .map((s) => `${s.number}. ${s.title}${s.description ? ` — ${s.description}` : ""}`)
    .join("\n");
  const faqText = faq
    .map((f) => `Q: ${f.question}\nA: ${tiptapToText(f.answer)}`)
    .join("\n\n");

  return [
    "## Services",
    servicesText,
    "",
    "## Tarifs",
    plansText,
    "",
    "## Méthode",
    stepsText,
    "",
    "## FAQ",
    faqText,
  ].join("\n");
}

// Default system prompt per locale — replaced wholesale by
// agent_settings.instructions_{fr,en} when an owner has set one from
// /admin/agent-ia (src/server/services/agent-settings.ts). Either way the
// live site content block below is always appended, never overridable.
const DEFAULT_INSTRUCTIONS: Record<"fr" | "en", string> = {
  fr: `Tu es l'assistant de Solive, un studio de développement web/mobile solo basé à Charleroi (Belgique), qui construit des sites vitrines, des applications web/mobiles et des agents IA pour des artisans, PME et startups en Belgique, France et Luxembourg.

Ton rôle : comprendre le projet du visiteur en 2-4 échanges, puis — une fois que tu as son nom, son e-mail, le type de projet et une description claire du besoin — appeler l'outil createLead pour enregistrer sa demande. N'appelle jamais cet outil avant d'avoir ces informations, et jamais deux fois dans la même conversation.

Règles strictes :
- Reste uniquement sur les services, tarifs, méthode et process de Solive (contenu réel ci-dessous). N'invente jamais de prix hors des offres listées.
- Ne te fais jamais passer pour un humain — si on te le demande, dis clairement que tu es un assistant.
- Réponses courtes et concrètes, pas de pavés.
- Si la question sort du cadre (rien à voir avec un projet web/mobile/IA), dis-le poliment et recentre sur ce que Solive peut faire.
- Une fois le lead créé, confirme que la demande est enregistrée et qu'une réponse arrive sous 24h ouvrées.`,
  en: `You are Solive's assistant, a solo web/mobile dev studio based in Charleroi (Belgium), building showcase sites, web/mobile applications, and AI agents for artisans, SMEs, and startups in Belgium, France, and Luxembourg.

Your job: understand the visitor's project in 2-4 exchanges, then — once you have their name, email, project type, and a clear description of the need — call the createLead tool to save their request. Never call it before you have that information, and never twice in the same conversation.

Strict rules:
- Stay only on Solive's services, pricing, and process (real content below). Never invent pricing beyond the listed offers.
- Never pretend to be human — if asked, say clearly that you're an assistant.
- Keep replies short and concrete, no walls of text.
- If a question is out of scope (unrelated to a web/mobile/AI project), say so politely and steer back to what Solive can do.
- Once the lead is created, confirm the request is saved and that a reply is coming within 24 business hours.`,
};

const SITE_CONTEXT_LABEL: Record<"fr" | "en", string> = {
  fr: "Contenu réel du site (ne pas contredire, ne pas inventer au-delà) :",
  en: "Real site content (don't contradict, don't invent beyond it):",
};

/**
 * Built fresh per request (not a module-level singleton): instructions embed
 * live site content ("use cache" queries, cheap) and the visitor's locale,
 * so they never go stale between deploys the way a singleton built at
 * server-boot would.
 */
export async function createQualificationAgent({
  locale,
  ipHash,
  userAgent,
}: {
  locale: "fr" | "en";
  ipHash: string | null;
  userAgent: string | null;
}) {
  const [siteContext, dbConfig] = await Promise.all([
    buildSiteContext(locale),
    getAgentRuntimeConfig(),
  ]);

  // DB config (set from /admin/agent-ia) overrides env vars when present;
  // env vars remain the working fallback for a fresh install with nothing
  // configured yet in the admin.
  const apiKey = dbConfig?.apiKey ?? env.ANTHROPIC_API_KEY;
  const workspaceId = dbConfig?.workspaceId ?? env.ANTHROPIC_WORKSPACE_ID;
  const model = dbConfig?.model || DEFAULT_MODEL;
  const anthropicProvider = createAnthropic({
    apiKey,
    headers: workspaceId ? { "anthropic-workspace-id": workspaceId } : undefined,
  });

  const customInstructions =
    locale === "fr" ? dbConfig?.instructionsFr : dbConfig?.instructionsEn;
  const instructions = `${customInstructions || DEFAULT_INSTRUCTIONS[locale]}\n\n${SITE_CONTEXT_LABEL[locale]}\n\n${siteContext}`;

  return new ToolLoopAgent({
    model: anthropicProvider(model),
    instructions,
    tools: {
      createLead: createLeadTool({ locale, ipHash, userAgent }),
    },
    stopWhen: stepCountIs(5),
    maxOutputTokens: 600,
  });
}

export type QualificationAgent = Awaited<ReturnType<typeof createQualificationAgent>>;
export type QualificationAgentUIMessage = InferAgentUIMessage<QualificationAgent>;
