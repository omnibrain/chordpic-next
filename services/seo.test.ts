import {
  canonicalPath,
  DEFAULT_LOCALE,
  isNoindexPath,
  localeUrl,
  PUBLIC_LOCALES,
  PUBLIC_PATHS,
  SITE_URL,
  sitemapEntries,
} from "./seo";

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
