import { Language, utsLocaleToLanguage } from "@magic-translate/core";
import { translate } from "../utils/translate";

export interface PageMetaProps {
  title: string;
  description?: string;
}

/** Translate page metadata on the server, retaining English during API outages. */
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
