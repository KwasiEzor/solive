import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { generateNonce, securityHeaders } from "@/lib/security-headers";

/**
 * Proxy (SLV-050/051/052): per-request CSP nonce + security headers,
 * server-side session refresh, /admin guard (never trust client state — the
 * guard is repeated in every Server Action too), an Origin/Host check on
 * mutating /api routes, and the /en locale rewrite (SLV-1xx i18n).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF: mutating /api routes must be same-origin (SLV-052). The offline
  // replay from the service worker lacks an Origin header, so it authenticates
  // with a custom header instead — which a cross-origin attacker cannot set
  // (CORS preflight blocks it).
  if (pathname.startsWith("/api")) {
    const isReplay =
      pathname === "/api/contact" &&
      request.headers.get("x-solive-replay") === "1";
    const same =
      isReplay ||
      isSameOrigin({
        method: request.method,
        origin: request.headers.get("origin"),
        host: request.headers.get("host"),
      });
    if (!same) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  // English lives under /en/... rewritten internally to the same French
  // route files, with the resolved locale passed via a request header (SLV
  // i18n) — the URL bar keeps /en/... (a rewrite, not a redirect); /admin,
  // /api, /connexion etc. never start with /en, so they're never touched.
  const isEn = pathname === "/en" || pathname.startsWith("/en/");
  const locale: "fr" | "en" = isEn ? "en" : "fr";
  // Effective (post-rewrite) path, for checks that must apply regardless of
  // an /en prefix — e.g. /en/admin must be guarded exactly like /admin.
  const effectivePath = isEn ? (pathname === "/en" ? "/" : pathname.slice("/en".length)) : pathname;

  const nonce = generateNonce();
  const isDev = env.NODE_ENV !== "production";
  const headers = securityHeaders(nonce, isDev);

  // Pass the nonce + CSP down so Next tags its own scripts with the nonce.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", headers["Content-Security-Policy"]!);
  requestHeaders.set("x-solive-locale", locale);

  function makeResponse(): NextResponse {
    if (!isEn) return NextResponse.next({ request: { headers: requestHeaders } });
    const url = request.nextUrl.clone();
    url.pathname = effectivePath;
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  let response = makeResponse();

  // Refresh the Supabase session and read the user (server-side).
  let user = null;
  if (env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
            response = makeResponse();
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      },
    );
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  // Guard /admin: no session → login (SLV-050). Checked against the
  // effective path so /en/admin is caught exactly like /admin — admin has no
  // English variant, so send it to the (French) login regardless.
  if (effectivePath.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("next", effectivePath);
    return NextResponse.redirect(url);
  }

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets, PWA files, and image/font files.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|sw.js|swe-worker-.*\\.js|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?)).*)",
  ],
};
