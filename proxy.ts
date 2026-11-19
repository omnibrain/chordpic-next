import { NextRequest, NextResponse } from "next/server";
import { refreshAccountSession } from "./services/auth-session";
import {
  defaultLocale,
  localizePathname,
  pathnameLocale,
  preferredLocale,
  stripLocaleFromPathname,
} from "./services/i18n";
import { CURRENCY_COOKIE, currencyForCountry } from "./services/currency";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Server-rendered pages that need the visitor's session.
const SESSION_PAGES = ["/account", "/my-chords"];

async function routeRequest(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = pathnameLocale(pathname);

  if (locale === defaultLocale) {
    const url = request.nextUrl.clone();
    url.pathname = stripLocaleFromPathname(pathname);
    const response = NextResponse.redirect(url, 308);
    // Otherwise /en -> / could immediately redirect back to the browser's
    // preferred language instead of honoring the explicitly requested English.
    response.cookies.set("NEXT_LOCALE", defaultLocale, {
      path: "/",
      sameSite: "lax",
      maxAge: ONE_YEAR,
    });
    return response;
  }

  if (pathname === "/") {
    const preferred = preferredLocale(
      request.cookies.get("NEXT_LOCALE")?.value,
      request.headers.get("accept-language"),
    );

    if (preferred !== defaultLocale) {
      const url = request.nextUrl.clone();
      url.pathname = localizePathname(pathname, preferred);
      return NextResponse.redirect(url);
    }
  }

  const sessionCookies = SESSION_PAGES.includes(
    stripLocaleFromPathname(pathname),
  )
    ? await refreshAccountSession(request)
    : [];
  const options = sessionCookies.length
    ? { request: { headers: request.headers } }
    : undefined;
  let response: NextResponse;

  if (locale) {
    response = NextResponse.next(options);
  } else {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === "/" ? "" : pathname}`;
    response = NextResponse.rewrite(url, options);
  }

  sessionCookies.forEach((cookie) => response.cookies.set(cookie));
  return response;
}

export async function proxy(request: NextRequest) {
  const response = await routeRequest(request);

  // Vercel's geo header, the same signal Checkout uses to pick the currency.
  // Absent locally, where the page then shows USD.
  response.cookies.set(
    CURRENCY_COOKIE,
    currencyForCountry(request.headers.get("x-vercel-ip-country")),
    { path: "/", sameSite: "lax" },
  );

  return response;
}

export const config = {
  matcher: ["/((?!api(?:/|$)|_next(?:/|$)|.*\\..*).*)"],
};
