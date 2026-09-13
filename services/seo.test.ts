import {
  canonicalPath,
  DEFAULT_LOCALE,
  isNoindexPath,
  localePath,
  localeUrl,
  PUBLIC_LOCALES,
  PUBLIC_PATHS,
  SITE_URL,
  sitemapEntries,
} from "./seo";
import { isRtl } from "../utils/translate";

describe("locale routing", () => {
  // This used to compare next.config.js's `i18n.locales` against
  // PUBLIC_LOCALES, because the two drifting apart is what left /ar, /fa and
  // /ur serving English at index,follow while no hreflang cluster and no
  // sitemap entry mentioned them. There is only one list now — app/[locale]'s
  // generateStaticParams and proxy.ts both read PUBLIC_LOCALES — so the drift
  // this guarded against is no longer expressible.
  const locales = PUBLIC_LOCALES;

  it("serves the default locale unprefixed and the rest prefixed", () => {
    expect(locales).toContain(DEFAULT_LOCALE);
    expect(localeUrl(DEFAULT_LOCALE, "/about")).toBe(`${SITE_URL}/about`);
    expect(localeUrl("de", "/about")).toBe(`${SITE_URL}/de/about`);
  });

  describe("localePath", () => {
    // Every internal link goes through this. `i18n` used to prefix hrefs by
    // itself, and when it went away the nav kept pointing at "/news" — so from
    // /de/about every link dropped the reader back into English.
    it("keeps the reader in their locale", () => {
      expect(localePath("de", "/news")).toBe("/de/news");
      expect(localePath("de", "/")).toBe("/de");
      expect(localePath(DEFAULT_LOCALE, "/news")).toBe("/news");
      expect(localePath(DEFAULT_LOCALE, "/")).toBe("/");
    });

    it("leaves routes that live outside app/[locale] alone", () => {
      // Prefixing these gave a 404: signing out and the OAuth callback are not
      // locale segments.
      expect(localePath("de", "/auth/logout")).toBe("/auth/logout");
      expect(localePath("de", "/api/webhooks")).toBe("/api/webhooks");
      expect(localePath("de", "/sitemap.xml")).toBe("/sitemap.xml");
    });

    it("leaves anything that is not a site-relative page path alone", () => {
      expect(localePath("de", "https://example.com")).toBe(
        "https://example.com",
      );
      expect(localePath("de", "#editor")).toBe("#editor");
      expect(localePath("de", "mailto:a@b.c")).toBe("mailto:a@b.c");
    });

    it("keeps the query and the hash on the end", () => {
      expect(localePath("de", "/signin?error=x")).toBe("/de/signin?error=x");
      expect(localePath("de", "/help#barre")).toBe("/de/help#barre");
    });
  });

  it("declares the right-to-left locales as such", () => {
    // A mirrored language rendered left to right is worse than an untranslated
    // one, so every RTL locale we route must be flagged.
    expect(locales.filter(isRtl).sort()).toEqual(["ar", "fa", "ur"]);
    expect(isRtl("en")).toBe(false);
    expect(isRtl(undefined)).toBe(false);
  });
});

describe("canonicalPath", () => {
  it("drops the query string and the hash", () => {
    expect(canonicalPath("/pricing?utm_source=x")).toBe("/pricing");
    expect(canonicalPath("/#N4IgbiBcoM5QdgcwLYFMDOAXA9g")).toBe("/");
    expect(canonicalPath("/help?a=1#b")).toBe("/help");
  });

  it("normalises the trailing slash but keeps the root", () => {
    expect(canonicalPath("/help/")).toBe("/help");
    expect(canonicalPath("/")).toBe("/");
  });
});

describe("isNoindexPath", () => {
  it("excludes auth, account and the sharing links", () => {
    expect(isNoindexPath("/signin")).toBe(true);
    expect(isNoindexPath("/account")).toBe(true);
    expect(isNoindexPath("/new-password")).toBe(true);
    expect(isNoindexPath("/playground")).toBe(true);
    expect(isNoindexPath("/chord/N4IgbiBcoM5QdgcwLYFMDOAXA9g")).toBe(true);
  });

  it("leaves the pages we want ranking alone", () => {
    PUBLIC_PATHS.forEach((path) => {
      expect(isNoindexPath(path)).toBe(false);
    });
  });

  it("does not match a prefix that is only a substring", () => {
    expect(isNoindexPath("/chords/c-major")).toBe(false);
    expect(isNoindexPath("/signing-up")).toBe(false);
  });
});

describe("localeUrl", () => {
  it("serves the default locale unprefixed", () => {
    expect(localeUrl(DEFAULT_LOCALE, "/")).toBe(`${SITE_URL}/`);
    expect(localeUrl(DEFAULT_LOCALE, "/pricing")).toBe(`${SITE_URL}/pricing`);
  });

  it("prefixes every other locale", () => {
    expect(localeUrl("de", "/")).toBe(`${SITE_URL}/de`);
    expect(localeUrl("de", "/pricing")).toBe(`${SITE_URL}/de/pricing`);
  });

  it("never emits a locale root with a trailing slash, which 308s", () => {
    PUBLIC_LOCALES.filter((locale) => locale !== DEFAULT_LOCALE).forEach(
      (locale) => {
        expect(localeUrl(locale, "/")).not.toMatch(/\/$/);
      },
    );
  });

  it("is stable across the query strings and hashes asPath carries", () => {
    expect(localeUrl("es", "/pricing?utm_source=x")).toBe(
      localeUrl("es", "/pricing"),
    );
  });
});

describe("sitemapEntries", () => {
  const entries = sitemapEntries();

  it("lists every public page in every public locale", () => {
    expect(entries).toHaveLength(PUBLIC_PATHS.length * PUBLIC_LOCALES.length);

    const urls = entries.map((entry) => entry.url);
    expect(urls).toContain(`${SITE_URL}/`);
    expect(urls).toContain(`${SITE_URL}/es`);
    expect(urls).toContain(`${SITE_URL}/pt/pricing`);
  });

  it("gives each entry a self-referencing hreflang cluster plus x-default", () => {
    entries.forEach((entry) => {
      const langs = entry.links?.map((link) => link.lang) ?? [];

      expect(langs).toEqual([...PUBLIC_LOCALES, "x-default"]);
      // Self-referencing: the entry's own URL is among its own alternates.
      expect(entry.links?.map((link) => link.url)).toContain(entry.url);
    });
  });

  it("points x-default at the default locale of the same page", () => {
    const pricing = entries.find(
      (entry) => entry.url === `${SITE_URL}/de/pricing`,
    );

    expect(
      pricing?.links?.find((link) => link.lang === "x-default")?.url,
    ).toBe(`${SITE_URL}/pricing`);
  });

  it("excludes everything marked noindex", () => {
    entries.forEach((entry) => {
      expect(isNoindexPath(entry.url.replace(SITE_URL, ""))).toBe(false);
    });
  });
});
