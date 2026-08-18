/**
 * Explicit Origin/Host check for mutating /api routes (SLV-052). Next's Server
 * Actions already verify origin; this covers route handlers too.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export interface OriginCheckInput {
  method: string;
  origin: string | null;
  host: string | null;
}

/** Returns true if the request origin matches its host (or is a safe method). */
export function isSameOrigin({ method, origin, host }: OriginCheckInput): boolean {
  if (SAFE_METHODS.has(method.toUpperCase())) return true;
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
