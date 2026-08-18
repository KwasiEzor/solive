import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSameOrigin } from "@/lib/csrf";
import { env } from "@/lib/env";
import { generateNonce, securityHeaders } from "@/lib/security-headers";

/**
 * Middleware (SLV-050/051/052): per-request CSP nonce + security headers,
 * server-side session refresh, /admin guard (never trust client state — the
 * guard is repeated in every Server Action too), and an Origin/Host check on
 * mutating /api routes.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CSRF: mutating /api routes must be same-origin (SLV-052).
  if (pathname.startsWith("/api")) {
    const same = isSameOrigin({
      method: request.method,
      origin: request.headers.get("origin"),
      host: request.headers.get("host"),
    });
    if (!same) {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  const nonce = generateNonce();
  const isDev = env.NODE_ENV !== "production";
  const headers = securityHeaders(nonce, isDev);

  // Pass the nonce + CSP down so Next tags its own scripts with the nonce.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", headers["Content-Security-Policy"]!);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

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
            response = NextResponse.next({ request: { headers: requestHeaders } });
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

  // Guard /admin: no session → login (SLV-050).
  if (pathname.startsWith("/admin") && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/connexion";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: [
    // Everything except static assets and image files.
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|svg|webp|avif|ico|woff2?)).*)",
  ],
};
