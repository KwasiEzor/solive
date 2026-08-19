import { render } from "@react-email/render";
import {
  LeadAcknowledgment,
  type AckLocale,
} from "@/emails/lead-acknowledgment";
import { LeadNotification } from "@/emails/lead-notification";
import type { EmailMessage } from "./types";

const ACK_SUBJECT: Record<AckLocale, string> = {
  fr: "Votre demande chez Solive",
  nl: "Uw aanvraag bij Solive",
  en: "Your request to Solive",
};

export async function buildLeadNotification(input: {
  to: string;
  name: string;
  email: string;
  company?: string | null;
  projectTypes: string[];
  budgetRange?: string | null;
  message: string;
  adminUrl: string;
}): Promise<EmailMessage> {
  const node = <LeadNotification {...input} />;
  return {
    to: input.to,
    subject: `Nouvelle demande — ${input.name}`,
    html: await render(node),
    text: await render(node, { plainText: true }),
    replyTo: input.email,
    replyToName: input.name,
  };
}

export async function buildLeadAcknowledgment(input: {
  email: string;
  name: string;
  locale: AckLocale;
}): Promise<EmailMessage> {
  const firstName = input.name.split(" ")[0] ?? input.name;
  const node = <LeadAcknowledgment firstName={firstName} locale={input.locale} />;
  return {
    to: input.email,
    toName: input.name,
    subject: ACK_SUBJECT[input.locale] ?? ACK_SUBJECT.fr,
    html: await render(node),
    text: await render(node, { plainText: true }),
  };
}
