"use client";

import { Language, utsLocaleToLanguage } from "@magic-translate/core";
import { createContext, useContext } from "react";

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
