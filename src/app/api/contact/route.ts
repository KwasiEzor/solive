import { type NextRequest, NextResponse } from "next/server";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { contactSchema, isHumanTiming } from "@/lib/schemas/contact";
import { env } from "@/lib/env";
import { writeAudit } from "@/server/services/audit";
import { getMailer } from "@/server/services/email";
import {
  buildLeadAcknowledgment,
  buildLeadNotification,
} from "@/server/services/email/messages";
import { createLeadIdempotent } from "@/server/services/leads-intake";
import { checkContactRateLimit } from "@/server/services/rate-limit";
import { verifyTurnstile } from "@/server/services/turnstile";

/**
 * Contact endpoint (SLV-030/055/084/130-131). Origin/Host is enforced by the
 * middleware. Layered anti-spam: Zod, honeypot, sub-2s timing, Turnstile, rate
 * limit. Idempotent on client_id. Emails are best-effort and fire once.
 */
export async function POST(request: NextRequest) {
  const raw = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(raw);
  // Honeypot (website != "") and shape errors both land here (SLV-055).
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const data = parsed.data;

  if (!isHumanTiming(data.elapsedMs)) {
    return NextResponse.json({ error: "too_fast" }, { status: 400 });
  }

  const ip = clientIpFromHeaders(request.headers) ?? "unknown";
  const ipHash = hashIp(ip, env.IP_HASH_SALT ?? "dev-insecure-salt");

  const rate = await checkContactRateLimit(ipHash);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSec: rate.retryAfterSec },
      { status: 429 },
    );
  }

  let turnstileOk = false;
  if (env.TURNSTILE_SECRET_KEY) {
    const v = await verifyTurnstile(data.turnstileToken, env.TURNSTILE_SECRET_KEY, ip);
    if (!v.ok) {
      return NextResponse.json({ error: "turnstile" }, { status: 400 });
    }
    turnstileOk = true;
  }

  const { id, created } = await createLeadIdempotent({
    clientId: data.clientId,
    name: data.name,
    email: data.email,
    company: data.company ?? null,
    projectTypes: data.projectTypes,
    message: data.message,
    budgetRange: data.budgetRange ?? null,
    locale: data.locale,
    source: "web",
    ipHash,
    userAgent: request.headers.get("user-agent"),
    turnstileOk,
    spamScore: 0,
    clientSubmittedAt: data.clientSubmittedAt,
  });

  if (created) {
    const mailer = getMailer();
    if (mailer && env.EMAIL_TO) {
      const adminUrl = `${env.NEXT_PUBLIC_SITE_URL}/admin/demandes/${id}`;
      const [notif, ack] = await Promise.all([
        buildLeadNotification({
          to: env.EMAIL_TO,
          name: data.name,
          email: data.email,
          company: data.company,
          projectTypes: data.projectTypes,
          budgetRange: data.budgetRange,
          message: data.message,
          adminUrl,
        }),
        buildLeadAcknowledgment({
          email: data.email,
          name: data.name,
          locale: data.locale,
        }),
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

  return NextResponse.json({ ok: true, id, duplicate: !created });
}
