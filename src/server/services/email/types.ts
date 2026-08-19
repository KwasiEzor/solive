import type { Result } from "@/lib/result";

export interface EmailMessage {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  replyToName?: string;
}

export type MailerError = "email_send_failed" | "email_unavailable";

/** Provider-agnostic mailer. Adapters (Brevo, …) implement this. */
export interface Mailer {
  send(message: EmailMessage): Promise<Result<void, MailerError>>;
}
