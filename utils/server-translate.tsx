import { createT } from "@magic-translate/react-ssr";
import { utsLocaleToLanguage, type TranslateOptions } from "@magic-translate/core";
import { PropsWithChildren } from "react";
import { translate } from "./translate";

/**
 * The server-rendered counterpart to `<T>` from @magic-translate/react: an
 * async server component that resolves the translation during the render, so
 * the HTML that leaves the server is already in the right language instead of
 * being swapped in from an effect after hydration.
 *
 * Only usable from a server component. Client components keep importing `T`
 * and `useT` from @magic-translate/react; where a client component needs a
 * server-translated string, translate it in the server parent and pass it down
 * as a prop.
 *
 * Note the library's own constraint: `<T>` may not contain React components,
 * only text and plain HTML elements. It throws if it does.
 */
/**
 * Unbound: takes an explicit `lang`. Only /languages needs it, to render each
 * language's name in that language rather than in the page's.
 */
export const T = createT(translate);

const RawT = T;

/**
 * The server counterpart to `useT()`, for strings that are not renderable
 * markup — an `alt`, a `title`, a `placeholder`. Awaited at the call site:
 * `alt={await t("Example chord chart")}`.
 */
export function serverTranslator(locale: string) {
  const lang = utsLocaleToLanguage(locale);

  return async (text: string): Promise<string> => {
    try {
      return (await translate(lang, text)) || text;
    } catch {
      // Same bargain as page metadata: an alt attribute is not worth failing a
      // build over, and English is a reasonable floor.
      return text;
    }
  };
}

/**
 * Binds `<T>` to the page's locale, so pages read `<T>text</T>` the way they
 * did on the client rather than repeating `lang` at every call site.
 */
export function serverT(locale: string) {
  const lang = utsLocaleToLanguage(locale);

  return function T({
    children,
    ...options
  }: PropsWithChildren<Omit<TranslateOptions, "lang">>) {
    return (
      <RawT lang={lang} {...options}>
        {children}
      </RawT>
    );
  };
}
