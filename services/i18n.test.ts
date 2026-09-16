/** @jest-environment node */

import {
  defaultLocale,
  isLocale,
  localizePathname,
  pathnameLocale,
  preferredLocale,
  stripLocaleFromPathname,
} from "./i18n";

describe("localized URLs", () => {
  it("preserves existing English URLs and prefixes other locales", () => {
    expect(localizePathname("/", "en")).toBe("/");
    expect(localizePathname("/news", "en")).toBe("/news");
    expect(localizePathname("/", "de")).toBe("/de");
    expect(localizePathname("/news", "de")).toBe("/de/news");
  });

  it("replaces locale prefixes while keeping queries and shared chord hashes", () => {
    expect(localizePathname("/de/news?source=menu#old-news", "fr")).toBe(
      "/fr/news?source=menu#old-news",
    );
    expect(localizePathname("/de?source=menu", "en")).toBe("/?source=menu");
    expect(localizePathname("/#N4IgbiBcoM5Q", "de")).toBe("/de#N4IgbiBcoM5Q");
    expect(localizePathname("/en/news", "de")).toBe("/de/news");
    expect(localizePathname("/de", "en")).toBe("/");
  });

  it.each([
    "https://chordpic.com/news",
    "https://example.com/path",
    "//example.com/path",
    "mailto:hello@example.com",
    "#news",
    "?tab=news",
    "/api/auth/logout",
    "/api?query=1",
    "/_next/image?url=test",
    "/images/chord.svg",
    "/sitemap.xml",
  ])("does not localize non-page destination %s", (href) => {
    expect(localizePathname(href, "de")).toBe(href);
  });

  it("only recognizes complete supported locale segments", () => {
    expect(pathnameLocale("/de/news")).toBe("de");
    expect(pathnameLocale("/de?next=1")).toBe("de");
    expect(pathnameLocale("/news")).toBeUndefined();
    expect(pathnameLocale("/debug")).toBeUndefined();
    expect(stripLocaleFromPathname("/de")).toBe("/");
    expect(stripLocaleFromPathname("/en/news")).toBe("/news");
    expect(stripLocaleFromPathname("/news")).toBe("/news");
    expect(isLocale(undefined)).toBe(false);
    expect(isLocale("xx")).toBe(false);
  });
});

describe("home page language detection", () => {
  it("prefers the visitor's explicit choice, including English", () => {
    expect(preferredLocale("en", "de-DE,de;q=0.9")).toBe("en");
    expect(preferredLocale("fr", "de-DE,de;q=0.9")).toBe("fr");
  });

  it("matches regional browser languages in quality order", () => {
    expect(preferredLocale(undefined, "en;q=0.5,de-CH;q=0.9,fr;q=0.8")).toBe(
      "de",
    );
    expect(preferredLocale(undefined, "ja,pt-BR;q=0.8,en;q=0.5")).toBe("pt");
    expect(preferredLocale("unsupported", "FR-ca")).toBe("fr");
  });

  it("ignores disabled and malformed choices and falls back to English", () => {
    expect(
      preferredLocale(undefined, "de;q=0,fr;q=invalid,nl;q=1.2,es;q=-1"),
    ).toBe(defaultLocale);
    expect(preferredLocale(undefined, "ja,*;q=0.5")).toBe(defaultLocale);
    expect(preferredLocale(undefined, null)).toBe(defaultLocale);
  });
});
