import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthClient } from "../services/auth-session";
import { localizePathname } from "../services/i18n";

export async function requireUser(locale: string) {
  const accessToken = (await cookies()).get("sb-access-token")?.value;
  const signInPath = localizePathname("/signin", locale);
  if (!accessToken) redirect(signInPath);

  const { user, error } = await createAuthClient().auth.api.getUser(
    accessToken,
  );
  if (error || !user) redirect(signInPath);

  return user;
}
