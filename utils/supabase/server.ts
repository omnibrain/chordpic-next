import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { AUTH_COOKIE_OPTIONS, supabaseCredentials } from "./cookies";

/**
 * Server client for App Router server components, route handlers and actions.
 *
 * `setAll` throws in a server component — only a route handler or an action may
 * write cookies — and that is fine: the browser client refreshes the session on
 * its own, so a token rotated during a render just gets written on the next
 * request that can write.
 */
export async function createClient() {
  const cookieStore = await cookies();
  const { url, anonKey } = supabaseCredentials();

  return createServerClient(url, anonKey, {
    cookieOptions: AUTH_COOKIE_OPTIONS,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a server component; see the note above.
        }
      },
    },
  });
}

/**
 * The signed-in user, or null.
 *
 * `getUser()` and not `getSession()`: the session comes straight out of a
 * cookie the browser could have written, `getUser()` revalidates it against the
 * auth server.
 */
export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}
