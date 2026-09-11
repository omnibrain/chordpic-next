import { Readable } from "node:stream";
import {
  ErrorLevel,
  LinkItem,
  SitemapItemLoose,
  SitemapStream,
  streamToPromise,
} from "sitemap";
import { Language } from "@magic-translate/react";
import { languageMap } from "../utils/translate";

/**
 * Hardcoded rather than derived from `getURL()`: that helper falls back to
 * `VERCEL_URL`, so on a preview deploy every canonical and hreflang would point
 * at the preview domain instead of production.
 */
export const SITE_URL = "https://chordpic.com";

export const DEFAULT_LOCALE = Language.EN;

/**
 * The locales we actually offer in the language switcher. `next.config.js` also
 * routes `ar`, `fa` and `ur`, which have no entry here — they stay crawlable but
 * are deliberately left out of the hreflang cluster and the sitemap until
 * they're either finished or dropped.
 */
export const PUBLIC_LOCALES = Object.keys(languageMap) as Language[];

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

export function isNoindexPath(asPath: string): boolean {
  const path = canonicalPath(asPath);

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
 * Every public page in every public locale, each entry carrying the full
 * hreflang cluster so the annotations are stated in two places Google reads.
 */
export function sitemapEntries(): SitemapItemLoose[] {
  return PUBLIC_PATHS.flatMap((path) => {
    const links: LinkItem[] = [
      ...PUBLIC_LOCALES.map((locale) => ({
        lang: locale,
        url: localeUrl(locale, path),
      })),
      { lang: "x-default", url: localeUrl(DEFAULT_LOCALE, path) },
    ];

    return PUBLIC_LOCALES.map((locale) => ({
      url: localeUrl(locale, path),
      links,
    }));
  });
}

export async function buildSitemap(): Promise<string> {
  const stream = new SitemapStream({
    hostname: SITE_URL,
    // Only the namespace the hreflang annotations need; the defaults also
    // declare news, video and image, none of which we emit.
    xmlns: { news: false, video: false, image: false, xhtml: true },
    // A malformed URL should fail the request rather than quietly ship a
    // sitemap Search Console will reject.
    level: ErrorLevel.THROW,
  });

  const xml = await streamToPromise(
    Readable.from(sitemapEntries()).pipe(stream),
  );

  return xml.toString();
}
