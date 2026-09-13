"use client";

import NextLink from "next/link";
import { ComponentProps } from "react";
import { localePath } from "../services/seo";
import { useLanguage } from "../utils/use-language";

type Props = Omit<ComponentProps<typeof NextLink>, "href"> & { href: string };

/**
 * `next/link` that keeps the reader in the locale they are already in.
 *
 * Under `i18n` this was the router's job. Use it for every internal link:
 * a plain `<Link href="/news">` on /de/about navigates to the English page.
 */
export function LocaleLink({ href, ...props }: Props) {
  const language = useLanguage();

  return <NextLink href={localePath(language, href)} {...props} />;
}
