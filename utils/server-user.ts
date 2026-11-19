import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthClient } from "../services/auth-session";
import { localizePathname } from "../services/i18n";

/** `next` is where signing in should return the visitor to. */
export async function requireUser(locale: string, next?: string) {
  const accessToken = (await cookies()).get("sb-access-token")?.value;
  const signInPath = localizePathname(
    next ? `/signin?next=${encodeURIComponent(next)}` : "/signin",
    locale,
  );
  if (!accessToken) redirect(signInPath);

  const { user, error } = await createAuthClient().auth.api.getUser(
    accessToken,
  );
  if (error || !user) redirect(signInPath);

  return user;
}
