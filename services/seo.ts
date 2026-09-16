// Types only: this module can be imported by client components, while
// `sitemap`'s runtime entrypoint pulls in node:path, node:readline and
// node:stream/promises, which webpack cannot resolve for the browser. The
// rendering half lives in ./sitemap.ts, which only the API route imports.
import type { LinkItem, SitemapItemLoose } from "sitemap";
import { defaultLocale, locales, stripLocaleFromPathname } from "./i18n";

/**
 * Hardcoded rather than derived from `getURL()`: that helper falls back to
 * `VERCEL_URL`, so on a preview deploy every canonical and hreflang would point
 * at the preview domain instead of production.
 */
export const SITE_URL = "https://chordpic.com";

export const DEFAULT_LOCALE = defaultLocale;

/**
 * The locales we offer in the language switcher, and so also the hreflang
 * cluster and the sitemap. The App Router locale configuration must route exactly
 * these — seo.test.ts asserts it, because the two drifting apart is what left
 * `ar`, `fa` and `ur` indexable but referenced by nothing.
 */
export const PUBLIC_LOCALES = locales;

/** Indexable pages, without their locale prefix. */
export const PUBLIC_PATHS = [
  "/",
  "/pricing",
  "/help",
  "/news",
  "/about",
  "/languages",
  "/terms",
  "/privacy-notice",
  "/cookie-policy",
];

/**
 * Authentication, account management, the Sentry playground, and `/chord/*` —
 * the last being an unbounded supply of thin, near-identical variants of the
 * home page, one per sharing link a user has ever generated.
 *
 * These are excluded with `noindex` rather than `Disallow` in robots.txt: a
 * disallowed URL is never fetched, so Google would never see the `noindex` and
 * anything already indexed would stay indexed.
 */
const NOINDEX_PREFIXES = [
  "/signin",
  "/signup",
  "/account",
  "/reset-password",
  "/new-password",
  "/playground",
  "/chord",
];

/**
 * `router.asPath` carries the query string and the hash; neither belongs in a
 * canonical URL. Chord state lives in the path segment, so nothing is lost.
 */
export function canonicalPath(asPath: string): string {
  const path = asPath.split(/[?#]/)[0];

  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }

  return path || "/";
}

/** Terms have one English body, even when the surrounding navigation is localized. */
export function pageLocales(path: string): readonly string[] {
  return canonicalPath(path) === "/terms" ? [DEFAULT_LOCALE] : PUBLIC_LOCALES;
}

export function canonicalLocale(locale: string, path: string): string {
  return pageLocales(path).includes(locale) ? locale : DEFAULT_LOCALE;
}

export function isNoindexPath(asPath: string): boolean {
  const path = canonicalPath(stripLocaleFromPathname(asPath));

  return NOINDEX_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Absolute URL for `path` in `locale`. The default locale is served unprefixed.
 *
 * The trailing slash matters: `https://chordpic.com/de/` answers with a 308 to
 * `/de`, and hreflang annotations pointing at a redirect are discarded.
 */
export function localeUrl(locale: string, asPath: string): string {
  const path = canonicalPath(asPath);
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;

  if (path === "/") {
    return prefix ? `${SITE_URL}${prefix}` : `${SITE_URL}/`;
  }

  return `${SITE_URL}${prefix}${path}`;
}

/**
 * Only canonical public URLs. Translated pages also carry their hreflang
 * cluster; English-only terms must not advertise duplicate language versions.
 */
export function sitemapEntries(): SitemapItemLoose[] {
  return PUBLIC_PATHS.flatMap((path) => {
    const links: LinkItem[] = [
      ...pageLocales(path).map((locale) => ({
        lang: locale,
        url: localeUrl(locale, path),
      })),
      { lang: "x-default", url: localeUrl(DEFAULT_LOCALE, path) },
    ];

    return pageLocales(path).map((locale) => ({
      url: localeUrl(locale, path),
      ...(pageLocales(path).length > 1 && { links }),
    }));
  });
}
