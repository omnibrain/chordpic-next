import { NextRequest, NextResponse } from "next/server";
import {
  ADS_COOKIE,
  BUCKET_COOKIE,
  parseAdsMode,
  parseBucket,
  randomBucket,
  resolveAdsArm,
} from "./services/feature-flags";
import { refreshAccountSession } from "./services/auth-session";
import {
  defaultLocale,
  localizePathname,
  pathnameLocale,
  preferredLocale,
  stripLocaleFromPathname,
} from "./services/i18n";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * The single seam between "which mode are we in" and everything else. Swap the
 * body for an Edge Config lookup to flip ads without redeploying; nothing
 * downstream needs to change.
 */
function readAdsMode() {
  return parseAdsMode(process.env.NEXT_PUBLIC_ADS_MODE);
}

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

  const sessionCookies =
    stripLocaleFromPathname(pathname) === "/account"
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

  // Set-Cookie from the server, never document.cookie: Safari's ITP caps
  // script-written cookies at seven days, which would re-randomise visitors
  // mid-experiment and pull any real effect towards zero.
  const existingBucket = parseBucket(request.cookies.get(BUCKET_COOKIE)?.value);
  const bucket = existingBucket ?? randomBucket();

  if (existingBucket === null) {
    response.cookies.set(BUCKET_COOKIE, String(bucket), {
      maxAge: ONE_YEAR,
      path: "/",
      sameSite: "lax",
    });
  }

  // Derived fresh every request rather than persisted, so flipping the mode
  // takes effect immediately instead of waiting out a year-old cookie.
  response.cookies.set(ADS_COOKIE, resolveAdsArm(readAdsMode(), bucket), {
    maxAge: ONE_YEAR,
    path: "/",
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!api(?:/|$)|_next(?:/|$)|.*\\..*).*)"],
};
