/**
 * The auth helpers kept people signed in for a year (`cookieOptions.lifetime`
 * in the old pages/api/auth handler). `@supabase/ssr` has no equivalent global,
 * so the same lifetime has to be handed to every client that writes cookies.
 */
export const AUTH_COOKIE_OPTIONS = {
  maxAge: 365 * 24 * 60 * 60,
} as const;

/**
 * Checked when a client is built rather than at import time: this module is
 * reachable from Layout and so from anything that renders it, and a throw at
 * module scope takes down unrelated tests and the sitemap route with it.
 */
export function supabaseCredentials() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required!",
    );
  }

  return { url, anonKey };
}
