import { createBrowserClient } from "@supabase/ssr";
import { AUTH_COOKIE_OPTIONS, supabaseCredentials } from "./cookies";

/**
 * `createBrowserClient` memoises per url+key, so this is the same client on
 * every call — the singleton the old `supabaseClient` export used to be.
 */
export function createClient() {
  const { url, anonKey } = supabaseCredentials();

  return createBrowserClient(url, anonKey, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
  });
}
