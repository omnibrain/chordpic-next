import type { Metadata } from "next";
import { localizedMeta, type PageMetaProps } from "./page-meta";
import {
  DEFAULT_LOCALE,
  isNoindexPath,
  localeUrl,
  pageLocales,
  canonicalLocale,
  SITE_URL,
} from "./seo";

export interface LocalizedPageProps {
  params: Promise<{ locale: string }>;
}

const defaultMeta: PageMetaProps = {
  title: "Free guitar chord diagram creator",
  description: "It has never been easier to create beautiful chord diagrams.",
};

/** Keep the former Layout metadata consistent across App Router pages. */
export async function createPageMetadata(
  locale: string,
  path: string,
  source: PageMetaProps = defaultMeta,
): Promise<Metadata> {
  const translated = await localizedMeta(locale, source);
  const title = `ChordPic | ${translated.title}`;
  const description = translated.description ?? defaultMeta.description;
  const noindex = isNoindexPath(path);
  const canonical = noindex
    ? undefined
    : localeUrl(canonicalLocale(locale, path), path);
  const image = `${SITE_URL}/logo.png`;

  return {
    title,
    description,
    robots: { index: !noindex, follow: true },
    ...(!noindex && {
      alternates: {
        canonical,
        ...(pageLocales(path).length > 1 && {
          languages: Object.fromEntries([
            ...pageLocales(path).map((language) => [
              language,
              localeUrl(language, path),
            ]),
            ["x-default", localeUrl(DEFAULT_LOCALE, path)],
          ]),
        }),
      },
    }),
    openGraph: {
      type: "website",
      siteName: "ChordPic",
      title,
      description,
      images: [image],
      ...(canonical && { url: canonical }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
