import { createLocalizedT, Language } from "@magic-translate/react-ssr";
import { translate } from "../utils/translate";

/** Bind each render to its locale while sharing the translation loader. */
export function serverTranslate(locale: string) {
  return createLocalizedT(
    async (language, text, options) =>
      language === Language.EN
        ? text
        : (await translate(language, text, options)) || text,
    locale,
  );
}
