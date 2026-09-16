"use client";

import NextLink from "next/link";
import React, { ComponentProps, forwardRef } from "react";
import { isLocale, localizePathname } from "../services/i18n";
import { useLanguage } from "../utils/use-language";

type Props = Omit<ComponentProps<typeof NextLink>, "locale"> & {
  locale?: string | false;
};

/** App Router links need an explicit locale in their destination URL. */
const LocalizedLink = forwardRef<HTMLAnchorElement, Props>(
  function LocalizedLink({ href, locale, onClick, ...props }, ref) {
    const currentLanguage = useLanguage();
    const targetLocale = typeof locale === "string" ? locale : currentLanguage;
    const localizedHref =
      locale === false
        ? href
        : typeof href === "string"
        ? localizePathname(href, targetLocale)
        : href.host || href.hostname || href.protocol || !href.pathname
        ? href
        : { ...href, pathname: localizePathname(href.pathname, targetLocale) };

    return (
      <NextLink
        {...props}
        ref={ref}
        href={localizedHref}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && isLocale(locale || undefined)) {
            document.cookie = `NEXT_LOCALE=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
          }
        }}
      />
    );
  },
);

export default LocalizedLink;
