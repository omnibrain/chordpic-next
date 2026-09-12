import { Language, utsLocaleToLanguage } from "@magic-translate/react";
import { translate } from "../utils/translate";

export interface PageMetaProps {
  title: string;
  /** Omitted by the legal pages, which fall back to Layout's default. */
  description?: string;
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
