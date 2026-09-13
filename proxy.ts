import { NextResponse, type NextRequest } from "next/server";
import {
  ADS_COOKIE,
  BUCKET_COOKIE,
  parseAdsMode,
  parseBucket,
  randomBucket,
  resolveAdsArm,
} from "./services/feature-flags";
import { DEFAULT_LOCALE, PUBLIC_LOCALES } from "./services/seo";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Remembers a locale the visitor was redirected to, so it happens only once. */
const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * The single seam between "which mode are we in" and everything else. Swap the
 * body for an Edge Config lookup to flip ads without redeploying; nothing
 * downstream needs to change.
 */
function readAdsMode() {
  return parseAdsMode(process.env.NEXT_PUBLIC_ADS_MODE);
}

function localeOf(pathname: string): string | null {
  const first = pathname.split("/")[1];

  return PUBLIC_LOCALES.includes(first as never) ? first : null;
}

/**
 * Best match between the browser's Accept-Language and the locales we serve.
 * Only the primary subtag is compared, so `pt-BR` picks `pt`.
 */
function preferredLocale(header: string | null): string {
  if (!header) {
    return DEFAULT_LOCALE;
  }

  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params
        .map((p) => p.trim())
        .find((p) => p.startsWith("q="))
        ?.slice(2);

      return { tag: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .filter(({ q }) => Number.isFinite(q))
    .sort((a, b) => b.q - a.q);

  return (
    ranked.find(({ tag }) => PUBLIC_LOCALES.includes(tag as never))?.tag ??
    DEFAULT_LOCALE
  );
}

/**
 * Locale routing, previously the `i18n` block in next.config.js — which the App
 * Router does not support.
 *
 * The URL shape is unchanged from what `i18n` produced, because canonicals and
 * hreflang in services/seo.ts already point at it: the default locale is served
 * unprefixed (`/about`) and every other locale is prefixed (`/de/about`). The
 * pages themselves live under `app/[locale]`, so an unprefixed path is
 * *rewritten* — not redirected — onto the `en` tree, leaving the address bar
 * alone.
 */
function localeResponse(request: NextRequest): NextResponse {
  const { pathname, search } = request.nextUrl;
  const locale = localeOf(pathname);

  if (locale) {
    // Already prefixed. `/en/about` is the one prefix we do not serve, since
    // /about is its canonical: send it there rather than indexing both.
    if (locale === DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = pathname.slice(DEFAULT_LOCALE.length + 1) || "/";

      // 308 and not the default 307: this one is permanent, and a temporary
      // redirect would leave /en/* eligible for indexing alongside its
      // canonical.
      return NextResponse.redirect(url, 308);
    }

    return NextResponse.next();
  }

  // Unprefixed. On a first visit to the home page, honour Accept-Language the
  // way `i18n`'s localeDetection did; afterwards the cookie keeps the choice.
  if (pathname === "/" && !request.cookies.has(LOCALE_COOKIE)) {
    const preferred = preferredLocale(request.headers.get("accept-language"));

    if (preferred !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = `/${preferred}`;

      const redirect = NextResponse.redirect(url);
      redirect.cookies.set(LOCALE_COOKIE, preferred, {
        maxAge: ONE_YEAR,
        path: "/",
        sameSite: "lax",
      });

      return redirect;
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  url.search = search;

  return NextResponse.rewrite(url);
}

export function proxy(request: NextRequest) {
  const response = localeResponse(request);

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
  matcher: [
    // Pages only. API routes, Next internals and anything with a file extension
    // are left alone. Unlike under `i18n`, `/` needs no separate entry: nothing
    // prepends a locale segment to the pattern any more.
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
