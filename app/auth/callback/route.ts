import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../utils/supabase/server";

/**
 * Where magic links, OAuth and password resets land.
 *
 * The auth helpers had `pages/api/auth/[...supabase]` do this. `@supabase/ssr`
 * uses PKCE, so the link carries a `code` that has to be exchanged for a
 * session here, on the server, where the cookies can be written.
 *
 * The Supabase project's allowed redirect URLs have to include
 * `<site>/auth/callback` for this to be reachable at all.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  // Only ever a site-relative path: an absolute one here would make this an
  // open redirect.
  const next = searchParams.get("next");
  const redirectTo = next?.startsWith("/") ? next : "/account";

  if (!code) {
    return NextResponse.redirect(`${origin}/signin?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback failed", error.message);

    return NextResponse.redirect(`${origin}/signin?error=auth_callback`);
  }

  return NextResponse.redirect(`${origin}${redirectTo}`);
}
