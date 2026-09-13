import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "../../../utils/supabase/server";

/** Replaces the auth helpers' `handleAuth({ logout: { returnTo: "/signin" } })`. */
async function logout(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(`${request.nextUrl.origin}/signin`);
}

// The nav item is a plain link, so this has to answer GET as it did before.
export const GET = logout;
export const POST = logout;
