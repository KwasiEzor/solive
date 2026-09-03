import { createAgentUIStreamResponse } from "ai";
import { type NextRequest, NextResponse } from "next/server";
import { hashIp } from "@/lib/hash";
import { clientIpFromHeaders } from "@/lib/request-ip";
import { env } from "@/lib/env";
import { createQualificationAgent } from "@/lib/agents/qualification-agent";
import { getRequestLocale } from "@/lib/i18n/locale";
import { checkAgentChatRateLimit } from "@/server/services/rate-limit";

/**
 * Qualification agent chat endpoint (SLV, agent IA). Public — no admin
 * session involved, this runs on the marketing site. Origin/Host is already
 * enforced by proxy.ts for mutating /api routes. Same-origin streaming
 * response — connect-src 'self' already covers it, no CSP change needed.
 */
export async function POST(request: NextRequest) {
  const ip = clientIpFromHeaders(request.headers) ?? "unknown";
  const ipHash = hashIp(ip, env.IP_HASH_SALT ?? "dev-insecure-salt");

  const rate = await checkAgentChatRateLimit(ipHash);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfterSec: rate.retryAfterSec },
      { status: 429 },
    );
  }

  const { messages } = await request.json();
  const locale = await getRequestLocale();
  const userAgent = request.headers.get("user-agent");

  const agent = await createQualificationAgent({ locale, ipHash, userAgent });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messages,
  });
}
