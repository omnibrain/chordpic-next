import {
  DataLoaderLoadParams,
  Language,
  T as ClientT,
  TranslateOptions,
  useT as useClientT,
  utsLocaleToLanguage,
} from "@magic-translate/react";
import parse from "html-react-parser";
// eslint-disable-next-line @next/next/no-document-import-in-page -- a type, not the component
import type { DocumentContext } from "next/document";
import React, {
  createContext,
  PropsWithChildren,
  ReactNode,
  useContext,
  useState,
} from "react";
import { renderToString } from "react-dom/server";
import { translate } from "./translate";
import { useLanguage } from "./use-language";

/**
 * Magic Translate swaps text inside `<T>` from an effect, so the server and the
 * first client render always emit English and every non-English page shows a
 * flash of it. Worse, Chrome sees English on /pt and offers to translate the
 * page, then rewrites nodes React owns — the NotFoundError crashes in Sentry.
 *
 * This module resolves the translations while the page is rendered on the
 * server (see `prepareSsrTranslations`, wired up in pages/_document.tsx) and
 * ships them alongside the markup, so the HTML that leaves the server is
 * already in the right language. Anything the server did not see — dialogs,
 * client-only branches, a translation API blip — falls back to the library's
 * own client-side behaviour.
 */

export const SSR_TRANSLATIONS_ID = "__magic_translate_ssr__";

export interface SsrTranslations {
  language: string;
  /** Keyed by `keyOf`, values are translated HTML. */
  entries: Record<string, string>;
}

type Formality = TranslateOptions["formality"];

interface TranslationRequest {
  text: string;
  lang: Language;
  formality?: Formality;
}

interface SsrTranslateContextValue extends SsrTranslations {
  /** Only set during the collecting pass. */
  collect?: (key: string, request: TranslationRequest) => void;
}

const NO_TRANSLATIONS: SsrTranslations = { language: "", entries: {} };

const SsrTranslateContext = createContext<SsrTranslateContextValue | null>(
  null,
);

function keyOf(text: string, options: TranslateOptions): string {
  return JSON.stringify([
    text,
    options.lang ?? null,
    options.formality ?? null,
  ]);
}

function sourceOf(children: ReactNode): string | null {
  if (React.Children.count(children) === 0) {
    return null;
  }

  if (typeof children === "string") {
    return children;
  }

  if (typeof children === "number" || typeof children === "boolean") {
    return null;
  }

  return renderToString(<>{children}</>);
}

let clientTranslations: SsrTranslations | undefined;

function readClientTranslations(): SsrTranslations {
  if (clientTranslations) {
    return clientTranslations;
  }

  clientTranslations = NO_TRANSLATIONS;

  if (typeof document !== "undefined") {
    const payload = document.getElementById(SSR_TRANSLATIONS_ID)?.textContent;

    if (payload) {
      try {
        clientTranslations = JSON.parse(payload) as SsrTranslations;
      } catch {
        // A corrupt payload just means everything falls back to the client.
      }
    }
  }

  return clientTranslations;
}

function useSsrTranslations(): SsrTranslateContextValue {
  return useContext(SsrTranslateContext) ?? readClientTranslations();
}

/**
 * `locale` is the page's language and decides whether the payload still
 * applies; `language` is what this particular string has to be translated to,
 * which `<T lang>` can override.
 */
function usePrerendered(
  children: ReactNode,
  options: TranslateOptions,
  locale: Language,
  language: Language,
): string | undefined {
  const translations = useSsrTranslations();

  // Resolved once per mount: the payload cannot change while the document
  // lives, and pinning it keeps the server markup and the first client render
  // identical, which is the whole point of the exercise.
  const [snapshot] = useState(() => {
    if (language === Language.EN || translations.language !== locale) {
      return null;
    }

    const text = sourceOf(children);

    if (text === null) {
      return null;
    }

    const key = keyOf(text, options);
    translations.collect?.(key, {
      text,
      lang: language,
      formality: options.formality,
    });

    return { locale, translation: translations.entries[key] };
  });

  return snapshot?.locale === locale ? snapshot?.translation : undefined;
}

export const T: React.FunctionComponent<
  PropsWithChildren<TranslateOptions>
> = ({ children, ...options }) => {
  const locale = useLanguage();
  const language = options.lang ?? locale;
  const prerendered = usePrerendered(children, options, locale, language);

  // The strings in the source are English, so there is nothing to ask the API.
  if (language === Language.EN) {
    return <>{children}</>;
  }

  if (prerendered !== undefined) {
    return <>{parse(prerendered)}</>;
  }

  return <ClientT {...options}>{children}</ClientT>;
};

export function useT() {
  const translations = useSsrTranslations();
  const locale = useLanguage();
  const clientT = useClientT();

  return (text: string, params: Omit<DataLoaderLoadParams, "text"> = {}) => {
    const language = params.lang ?? locale;

    if (language === Language.EN) {
      return text;
    }

    if (translations.language === locale) {
      const key = keyOf(text, params);

      if (translations.collect) {
        translations.collect(key, {
          text,
          lang: language,
          formality: params.formality,
        });

        return text;
      }

      const prerendered = translations.entries[key];

      if (prerendered !== undefined) {
        return prerendered;
      }
    }

    return clientT(text, params);
  };
}

function SsrTranslationsProvider({
  children,
  ...value
}: PropsWithChildren<SsrTranslateContextValue>) {
  return (
    <SsrTranslateContext.Provider value={value}>
      {children}
    </SsrTranslateContext.Provider>
  );
}

/** Kept small so a page full of text does not become one oversized request. */
const BATCH_SIZE = 20;

/** A hung translate API must not be able to hold up a deploy. */
const TIMEOUT_MS = 15_000;

async function resolve(
  requests: Map<string, TranslationRequest>,
): Promise<Record<string, string>> {
  const entries: Record<string, string> = {};
  const pending = Array.from(requests.entries());

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    await Promise.all(
      pending.slice(i, i + BATCH_SIZE).map(async ([key, request]) => {
        const translation = await translate(
          request.lang,
          request.text,
          request.formality ? { formality: request.formality } : undefined,
        );

        if (translation) {
          entries[key] = translation;
        }
      }),
    );
  }

  return entries;
}

/**
 * Renders the page once to find every string on it, translates them, and
 * rewires `ctx.renderPage` so the render Next actually serves gets the results.
 * The markup of the first pass is thrown away.
 */
export async function prepareSsrTranslations(
  ctx: DocumentContext,
): Promise<SsrTranslations> {
  const language = utsLocaleToLanguage(ctx.locale);
  const renderPage = ctx.renderPage;
  const requests = new Map<string, TranslationRequest>();
  let entries: Record<string, string> = {};

  if (language !== Language.EN) {
    await renderPage({
      enhanceApp: (App) =>
        function CollectingApp(props) {
          return (
            <SsrTranslationsProvider
              language={language}
              entries={{}}
              collect={(key, request) => {
                if (!requests.has(key)) {
                  requests.set(key, request);
                }
              }}
            >
              <App {...props} />
            </SsrTranslationsProvider>
          );
        },
    });

    let timeout: ReturnType<typeof setTimeout> | undefined;

    try {
      entries = await Promise.race([
        resolve(requests),
        new Promise<never>((_, reject) => {
          timeout = setTimeout(
            () => reject(new Error("timed out")),
            TIMEOUT_MS,
          );
        }),
      ]);
    } catch (error) {
      // Same trade-off as services/page-meta.ts: serving English beats failing
      // the render, and the client still translates what it can.
      console.warn(
        `Could not prerender translations for ${language}, falling back to the client:`,
        error instanceof Error ? error.message : error,
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  const translations: SsrTranslations = { language, entries };

  ctx.renderPage = () =>
    renderPage({
      enhanceApp: (App) =>
        function TranslatedApp(props) {
          return (
            <SsrTranslationsProvider {...translations}>
              <App {...props} />
            </SsrTranslationsProvider>
          );
        },
    });

  return translations;
}

export function SsrTranslationsScript({
  translations,
}: {
  translations?: SsrTranslations;
}) {
  if (!translations || Object.keys(translations.entries).length === 0) {
    return null;
  }

  return (
    <script
      id={SSR_TRANSLATIONS_ID}
      type="application/json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(translations).replace(/</g, "\\u003c"),
      }}
    />
  );
}
