import "server-only";
import { tool } from "ai";
import { z } from "zod";
import { env } from "@/lib/env";
import { writeAudit } from "@/server/services/audit";
import { getMailer } from "@/server/services/email";
import {
  buildLeadAcknowledgment,
  buildLeadNotification,
} from "@/server/services/email/messages";
import { createLeadIdempotent } from "@/server/services/leads-intake";

/**
 * Lead-creation tool for the qualification agent (SLV, agent IA). Reproduces
 * the `created` branch of src/app/api/contact/route.ts exactly (same
 * createLeadIdempotent call, same emails, same audit entry) — a real
 * multi-turn conversation is a stronger anti-bot signal than the form's
 * honeypot/timing/Turnstile checks, so this path skips those without
 * weakening anything downstream (turnstileOk is only ever stored, never
 * enforced by createLeadIdempotent itself).
 */
export function createLeadTool({
  locale,
  ipHash,
  userAgent,
}: {
  locale: "fr" | "en";
  ipHash: string | null;
  userAgent: string | null;
}) {
  return tool({
    description:
      "Save the visitor's project request once you have their name, email, " +
      "project type, and a clear description of what they need. Call this " +
      "only once per conversation, after the visitor has confirmed the " +
      "details are correct.",
    inputSchema: z.object({
      name: z.string().min(1).max(120),
      email: z.string().email(),
      company: z.string().max(160).optional(),
      projectTypes: z
        .array(z.string().max(60))
        .max(10)
        .describe(
          "Canonical project type labels, e.g. \"Site vitrine\", \"Application web\".",
        ),
      message: z
        .string()
        .min(10)
        .max(5000)
        .describe("A clear summary of the visitor's project, synthesized from the conversation."),
      budgetRange: z.string().max(60).optional(),
    }),
    execute: async ({ name, email, company, projectTypes, message, budgetRange }) => {
      const { id, created } = await createLeadIdempotent({
        clientId: crypto.randomUUID(),
        name,
        email,
        company: company ?? null,
        projectTypes,
        message,
        budgetRange: budgetRange ?? null,
        locale,
        source: "web",
        ipHash,
        userAgent,
        turnstileOk: true,
        spamScore: 0,
      });

      if (created) {
        const mailer = getMailer();
        if (mailer && env.EMAIL_TO) {
          const adminUrl = `${env.NEXT_PUBLIC_SITE_URL}/admin/demandes/${id}`;
          const [notif, ack] = await Promise.all([
            buildLeadNotification({
              to: env.EMAIL_TO,
              name,
              email,
              company,
              projectTypes,
              budgetRange,
              message,
              adminUrl,
            }),
            buildLeadAcknowledgment({ email, name, locale }),
          ]);
          await Promise.allSettled([mailer.send(notif), mailer.send(ack)]);
        }
        await writeAudit({
          actorId: null,
          action: "create",
          entityType: "lead",
          entityId: id,
          ipHash,
        });
      }

      return { ok: true, duplicate: !created };
    },
  });
}
