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

export interface PageMetadataOptions {
  /**
   * A name to lead with, used verbatim. Page titles are translated, so this is
   * for content a visitor supplied — a chord's own title — and it comes first
   * because that is the half a browser tab has room for.
   */
  name?: string;
  /** Leave the preview image to an opengraph-image route in the segment. */
  generatedImage?: boolean;
}

/** Keep the former Layout metadata consistent across App Router pages. */
export async function createPageMetadata(
  locale: string,
  path: string,
  source: PageMetaProps = defaultMeta,
  { name, generatedImage }: PageMetadataOptions = {},
): Promise<Metadata> {
  const translated = await localizedMeta(locale, source);
  const title = name ? `${name} | ChordPic` : `ChordPic | ${translated.title}`;
  const description = translated.description ?? defaultMeta.description;
  const noindex = isNoindexPath(path);
  const canonical = noindex
    ? undefined
    : localeUrl(canonicalLocale(locale, path), path);
  const image = generatedImage ? undefined : `${SITE_URL}/logo.png`;

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
      // Naming images here would win over a colocated opengraph-image route.
      ...(image && { images: [image] }),
      ...(canonical && { url: canonical }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}
