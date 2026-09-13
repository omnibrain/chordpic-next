import { Language, utsLocaleToLanguage } from "@magic-translate/core";
import type { Metadata } from "next";
import { translate } from "../utils/translate";
import {
  DEFAULT_LOCALE,
  isNoindexPath,
  localeUrl,
  PUBLIC_LOCALES,
  SITE_URL,
} from "./seo";

export const TITLE_PREFIX = "ChordPic";

export const DEFAULT_DESCRIPTION =
  "It has never been easier to create beautiful chord diagrams.";

export interface PageMetaProps {
  title: string;
  /** Omitted by the legal pages, which fall back to the default above. */
  description?: string;
  /** Site-relative; made absolute for og:image and twitter:image. */
  cardImage?: string;
}

/**
 * `<title>` and `<meta description>` are the one part of a page Magic Translate
 * never reaches: it swaps the text inside `<T>` after hydration, and these live
 * in `<Head>` as plain strings. So every locale was serving the English tags.
 *
 * Google noticed. On chordpic.com/es it discarded our
 * "ChordPic | Free guitar chord diagram creator" and substituted the rendered
 * Spanish `<h1>`; on chordpic.com/pt/news it did not bother, and the Portuguese
 * page sits in Portuguese results titled "ChordPic | News".
 *
 * Translating at build time hands that decision back to us. Call it from
 * getStaticProps and spread the result into props — Layout already reads
 * `title` and `description` off pageProps.
 */
export async function localizedMeta(
  locale: string | undefined,
  meta: PageMetaProps,
): Promise<PageMetaProps> {
  const language = utsLocaleToLanguage(locale);

  if (language === Language.EN) {
    return meta;
  }

  try {
    const [title, description] = await Promise.all([
      translate(language, meta.title),
      // Spreading `description: undefined` over Layout's defaults would blank
      // it, so the key has to stay absent when the page has none.
      meta.description ? translate(language, meta.description) : undefined,
    ]);

    return {
      // A provider answering with an empty string should not blank a title.
      title: title || meta.title,
      ...(meta.description
        ? { description: description || meta.description }
        : {}),
    };
  } catch (error) {
    // Deliberately swallowed. These strings are a nice-to-have, and a build is
    // not worth failing over a translation API blip — a production deploy was
    // already lost once to an upstream timeout during page generation.
    console.warn(
      `Could not translate page metadata to ${language}, falling back to English:`,
      error instanceof Error ? error.message : error,
    );

    return meta;
  }
}

/**
 * The document metadata Layout used to render into `<Head>`, as a Next
 * `Metadata` object: title and description translated for the locale, plus the
 * canonical and the full hreflang cluster.
 *
 * Google requires an hreflang cluster to be self-referencing, and had been
 * discarding this one for listing only the *other* languages — so the current
 * locale is included, alongside x-default.
 */
export async function pageMetadata(
  locale: string,
  path: string,
  meta: PageMetaProps,
): Promise<Metadata> {
  const { title, description } = await localizedMeta(locale, {
    description: DEFAULT_DESCRIPTION,
    ...meta,
  });

  const fullTitle = `${TITLE_PREFIX} | ${title}`;
  const noindex = isNoindexPath(path);
  const canonical = noindex ? undefined : localeUrl(locale, path);
  // Crawlers resolve og:image against nothing, so a site-relative path is a
  // broken card on every platform that renders one.
  const cardImage = `${SITE_URL}${meta.cardImage ?? "/logo.png"}`;

  return {
    title: fullTitle,
    description,
    robots: noindex ? "noindex, follow" : "index, follow",
    alternates: canonical
      ? {
          canonical,
          languages: {
            ...Object.fromEntries(
              PUBLIC_LOCALES.map((lang) => [lang, localeUrl(lang, path)]),
            ),
            "x-default": localeUrl(DEFAULT_LOCALE, path),
          },
        }
      : undefined,
    openGraph: {
      type: "website",
      siteName: TITLE_PREFIX,
      title: fullTitle,
      description,
      images: [cardImage],
      ...(canonical ? { url: canonical } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [cardImage],
    },
  };
}
