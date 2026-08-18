import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/server/auth/supabase-server";

/**
 * PKCE callback for email links (password reset, invitations). Exchanges the
 * one-time code for a session, then redirects to the safe internal `next` path.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/admin";
  // Only allow internal redirects (open-redirect guard).
  const next = nextParam.startsWith("/") ? nextParam : "/admin";

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
  }
  return NextResponse.redirect(`${origin}/connexion?error=auth`);
}
