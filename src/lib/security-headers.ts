/**
 * Security headers (SLV-051). CSP uses a per-request nonce — no 'unsafe-inline'.
 * HSTS with preload, nosniff, strict referrer policy, minimal permissions
 * policy, X-Frame-Options DENY.
 */

export function generateNonce(): string {
  // 16 random bytes, base64 — unique per request.
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}

export function contentSecurityPolicy(nonce: string, isDev = false): string {
  // Cloudinary for images, Supabase for API/websocket, Turnstile for the widget.
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "script-src": [
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      "https://challenges.cloudflare.com",
      ...(isDev ? ["'unsafe-eval'"] : []),
    ],
    // Styles can't execute code; inline style attributes (animation delays,
    // etc.) require 'unsafe-inline' — and a style nonce would disable it. Scripts
    // stay strict (nonce, no unsafe-inline) per SLV-051's intent.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:", "https://res.cloudinary.com"],
    "font-src": ["'self'"],
    // TODO(Sentry): once NEXT_PUBLIC_SENTRY_DSN is set for real, add this
    // Sentry project's ingest origin here (e.g. https://o<org>.ingest.<region>.sentry.io)
    // — no wildcard on this policy, error/perf events are silently blocked
    // until it's listed explicitly.
    "connect-src": ["'self'", "https://*.supabase.co", "https://api.pwnedpasswords.com"],
    "frame-src": ["https://challenges.cloudflare.com"],
    "frame-ancestors": ["'none'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
    "worker-src": ["'self'"],
    "manifest-src": ["'self'"],
    "upgrade-insecure-requests": [],
  };
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

export function securityHeaders(nonce: string, isDev = false): Record<string, string> {
  return {
    "Content-Security-Policy": contentSecurityPolicy(nonce, isDev),
    "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    "X-Frame-Options": "DENY",
  };
}
