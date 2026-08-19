import { err, ok, type Result } from "@/lib/result";
import type { EmailMessage, Mailer, MailerError } from "./types";

const BREVO_URL = "https://api.brevo.com/v3/smtp/email";

/**
 * Brevo transactional adapter (EU/GDPR). Thin wrapper over the HTTP API so the
 * provider stays swappable behind the Mailer interface. No SDK lock-in.
 */
export class BrevoMailer implements Mailer {
  constructor(
    private readonly apiKey: string,
    private readonly from: { email: string; name: string },
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async send(message: EmailMessage): Promise<Result<void, MailerError>> {
    try {
      const res = await this.fetchImpl(BREVO_URL, {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: this.from,
          to: [{ email: message.to, name: message.toName }],
          replyTo: message.replyTo
            ? { email: message.replyTo, name: message.replyToName }
            : undefined,
          subject: message.subject,
          htmlContent: message.html,
          textContent: message.text,
        }),
      });
      if (!res.ok) return err("email_send_failed");
      return ok(undefined);
    } catch {
      return err("email_unavailable");
    }
  }
}
