/** URL locales are independent of the translation client and safe in Proxy. */
export const locales = [
  "en",
  "zh",
  "hi",
  "es",
  "fr",
  "ar",
  "ru",
  "pt",
  "it",
  "ur",
  "de",
  "fa",
  "nl",
] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function pathnameLocale(pathname: string): Locale | undefined {
  const firstSegment = pathname.split(/[/?#]/)[1];
  return isLocale(firstSegment) ? firstSegment : undefined;
}

export function stripLocaleFromPathname(pathname: string): string {
  const locale = pathnameLocale(pathname);
  if (!locale) return pathname;

  const rest = pathname.slice(locale.length + 1);
  return rest.startsWith("/") ? rest : `/${rest}`;
}

/** Keep English URLs unprefixed, including after switching from another locale. */
export function localizePathname(href: string, locale: string): string {
  if (
    !href.startsWith("/") ||
    href.startsWith("//") ||
    /^\/(?:api|_next)(?:\/|[?#]|$)/.test(href) ||
    /\.[^/]+$/.test(href.split(/[?#]/)[0])
  ) {
    return href;
  }

  const pathname = stripLocaleFromPathname(href);
  if (!isLocale(locale) || locale === defaultLocale) return pathname;

  // /de is canonical; preserve the slash before a query or a hash only when
  // needed to represent a nested path.
  return `/${locale}${
    pathname === "/" ? "" : pathname.replace(/^\/(?=[?#])/, "")
  }`;
}

/** Match the old Pages Router's locale detection on the home page. */
export function preferredLocale(
  cookie: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (isLocale(cookie)) return cookie;

  const preferences = (acceptLanguage ?? "")
    .split(",")
    .map((entry) => {
      const [tag, ...parameters] = entry.trim().toLowerCase().split(";");
      const quality = parameters.find((parameter) =>
        parameter.trim().startsWith("q="),
      );
      return {
        locale: tag.split("-")[0],
        weight: quality ? Number(quality.trim().slice(2)) : 1,
      };
    })
    .filter(
      ({ weight }) => Number.isFinite(weight) && weight > 0 && weight <= 1,
    )
    .sort((left, right) => right.weight - left.weight);

  return (
    (preferences.find(({ locale }) => isLocale(locale))?.locale as
      | Locale
      | undefined) ?? defaultLocale
  );
}
