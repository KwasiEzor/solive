import { err, ok, type Result } from "@/lib/result";

/**
 * Server-side Cloudflare Turnstile verification (SLV-055). The token from the
 * widget is validated against the siteverify endpoint with the secret key.
 */
const VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileError = "turnstile_failed" | "turnstile_unavailable";

export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp?: string | null,
  fetchImpl: typeof fetch = fetch,
): Promise<Result<true, TurnstileError>> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);
  try {
    const res = await fetchImpl(VERIFY_URL, { method: "POST", body });
    if (!res.ok) return err("turnstile_unavailable");
    const data = (await res.json()) as { success?: boolean };
    return data.success ? ok(true) : err("turnstile_failed");
  } catch {
    return err("turnstile_unavailable");
  }
}
