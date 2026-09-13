"use client";

import { Language, utsLocaleToLanguage } from "@magic-translate/core";
import { createContext, useCallback, useContext } from "react";
import { localePath } from "../services/seo";

/**
 * The App Router has no `router.locale`, so the locale comes down from the
 * `[locale]` segment through Providers instead of being read off the router.
 */
export const LanguageContext = createContext<`${Language}`>(
  utsLocaleToLanguage(undefined),
);

export function useLanguage(): `${Language}` {
  return useContext(LanguageContext);
}

/**
 * Locale-aware `router.push`/`replace` targets, for the navigations that do not
 * go through a `<LocaleLink>`.
 */
export function useLocalePath(): (path: string) => string {
  const language = useLanguage();

  // Stable per locale, so callers can list it as an effect dependency without
  // the effect re-running on every render.
  return useCallback((path: string) => localePath(language, path), [language]);
}
