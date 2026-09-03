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

// Direct Anthropic call (@ai-sdk/anthropic), not the AI Gateway — this
// project's Vercel account doesn't have paid Gateway credits unlocked for
// this model on the free tier. The configured key is identity-linked
// (tied to a personal Anthropic account rather than a workspace), which
// the API requires an explicit workspace id header for.
const anthropicProvider = createAnthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  headers: env.ANTHROPIC_WORKSPACE_ID
    ? { "anthropic-workspace-id": env.ANTHROPIC_WORKSPACE_ID }
    : undefined,
});
const MODEL = anthropicProvider("claude-haiku-4-5");

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

const INSTRUCTIONS = {
  fr: (siteContext: string) => `Tu es l'assistant de Solive, un studio de développement web/mobile solo basé à Charleroi (Belgique), qui construit des sites vitrines, des applications web/mobiles et des agents IA pour des artisans, PME et startups en Belgique, France et Luxembourg.

Ton rôle : comprendre le projet du visiteur en 2-4 échanges, puis — une fois que tu as son nom, son e-mail, le type de projet et une description claire du besoin — appeler l'outil createLead pour enregistrer sa demande. N'appelle jamais cet outil avant d'avoir ces informations, et jamais deux fois dans la même conversation.

Règles strictes :
- Reste uniquement sur les services, tarifs, méthode et process de Solive (contenu réel ci-dessous). N'invente jamais de prix hors des offres listées.
- Ne te fais jamais passer pour un humain — si on te le demande, dis clairement que tu es un assistant.
- Réponses courtes et concrètes, pas de pavés.
- Si la question sort du cadre (rien à voir avec un projet web/mobile/IA), dis-le poliment et recentre sur ce que Solive peut faire.
- Une fois le lead créé, confirme que la demande est enregistrée et qu'une réponse arrive sous 24h ouvrées.

Contenu réel du site (ne pas contredire, ne pas inventer au-delà) :

${siteContext}`,
  en: (siteContext: string) => `You are Solive's assistant, a solo web/mobile dev studio based in Charleroi (Belgium), building showcase sites, web/mobile applications, and AI agents for artisans, SMEs, and startups in Belgium, France, and Luxembourg.

Your job: understand the visitor's project in 2-4 exchanges, then — once you have their name, email, project type, and a clear description of the need — call the createLead tool to save their request. Never call it before you have that information, and never twice in the same conversation.

Strict rules:
- Stay only on Solive's services, pricing, and process (real content below). Never invent pricing beyond the listed offers.
- Never pretend to be human — if asked, say clearly that you're an assistant.
- Keep replies short and concrete, no walls of text.
- If a question is out of scope (unrelated to a web/mobile/AI project), say so politely and steer back to what Solive can do.
- Once the lead is created, confirm the request is saved and that a reply is coming within 24 business hours.

Real site content (don't contradict, don't invent beyond it):

${siteContext}`,
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
  const siteContext = await buildSiteContext(locale);
  return new ToolLoopAgent({
    model: MODEL,
    instructions: INSTRUCTIONS[locale](siteContext),
    tools: {
      createLead: createLeadTool({ locale, ipHash, userAgent }),
    },
    stopWhen: stepCountIs(5),
    maxOutputTokens: 600,
  });
}

export type QualificationAgent = Awaited<ReturnType<typeof createQualificationAgent>>;
export type QualificationAgentUIMessage = InferAgentUIMessage<QualificationAgent>;
