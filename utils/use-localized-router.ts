"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { localizePathname } from "../services/i18n";
import { useLanguage } from "./use-language";

export function useLocalizedRouter(): ReturnType<typeof useRouter> {
  const router = useRouter();
  const language = useLanguage();

  return useMemo(
    () => ({
      ...router,
      push: (href, options) =>
        router.push(localizePathname(href, language), options),
      replace: (href, options) =>
        router.replace(localizePathname(href, language), options),
    }),
    [router, language],
  );
}
