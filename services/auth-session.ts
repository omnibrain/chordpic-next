import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

const ACCESS_TOKEN = "sb-access-token";
const REFRESH_TOKEN = "sb-refresh-token";
const ONE_YEAR = 365 * 24 * 60 * 60;
const REFRESH_MARGIN = 10;

export function createAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  );
}

type SessionCookie = {
  name: string;
  value: string;
  maxAge: number;
  path: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
};

function needsRefresh(token: string | undefined): boolean {
  if (!token) return true;

  try {
    // This unverified expiry only decides whether to refresh. The account
    // Server Component always verifies the resulting token with Supabase.
    const { exp } = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
    );
    return (
      typeof exp !== "number" ||
      !Number.isFinite(exp) ||
      exp < Math.round(Date.now() / 1000) + REFRESH_MARGIN
    );
  } catch {
    return true;
  }
}

/** Refresh in Proxy: Server Components can read cookies but cannot write them. */
export async function refreshAccountSession(
  request: NextRequest,
): Promise<SessionCookie[]> {
  const accessToken = request.cookies.get(ACCESS_TOKEN)?.value;
  const refreshToken = request.cookies.get(REFRESH_TOKEN)?.value;
  if (!refreshToken || !needsRefresh(accessToken)) return [];

  const { data, error } = await createAuthClient().auth.api.refreshAccessToken(
    refreshToken,
  );
  if (error || !data?.access_token || !data.refresh_token) return [];

  // Match the existing Pages API auth handlers, including local development.
  const hostname = request.nextUrl.hostname;
  const secure =
    hostname !== "localhost" &&
    hostname !== "127.0.0.1" &&
    !hostname.endsWith(".local");
  const cookies: SessionCookie[] = [
    { name: ACCESS_TOKEN, value: data.access_token },
    { name: REFRESH_TOKEN, value: data.refresh_token },
  ].map((cookie) => ({
    ...cookie,
    maxAge: ONE_YEAR,
    path: "/",
    httpOnly: true,
    secure,
    sameSite: "lax",
  }));

  // Forward these request headers to the page as well as setting the response
  // cookies, so this very request sees the refreshed session.
  cookies.forEach(({ name, value }) => request.cookies.set(name, value));
  return cookies;
}
