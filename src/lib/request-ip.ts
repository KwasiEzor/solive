/**
 * Extract the client IP from proxy headers (Vercel sets x-forwarded-for).
 * The left-most entry is the originating client. Returns null if absent.
 */
export function clientIpFromHeaders(headers: {
  get(name: string): string | null;
}): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip");
}
