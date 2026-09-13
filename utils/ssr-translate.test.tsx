import { Language, MagicTranslateProvider } from "@magic-translate/react";
import { render, screen } from "@testing-library/react";
// eslint-disable-next-line @next/next/no-document-import-in-page -- a type, not the component
import type { DocumentContext } from "next/document";
import React, { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  prepareSsrTranslations,
  SSR_TRANSLATIONS_ID,
  T,
  useT,
} from "./ssr-translate";
import { translate } from "./translate";

jest.mock("./translate", () => ({ translate: jest.fn() }));

const mockTranslate = translate as jest.MockedFunction<typeof translate>;

let mockLocale = Language.PT;

jest.mock("next/router", () => ({
  useRouter: () => ({ locale: mockLocale }),
}));

const key = (text: string) => JSON.stringify([text, null, null]);

function Page({ children }: { children: ReactNode }) {
  return (
    <MagicTranslateProvider
      language={mockLocale}
      apiKey="test-key"
      _loaderFactory={() => async (items) =>
        items.map(({ text }) => `client:${text}`)
      }
    >
      {children}
    </MagicTranslateProvider>
  );
}

/** A DocumentContext with just enough of `renderPage` to drive both passes. */
function documentContext(page: ReactNode): DocumentContext {
  return {
    locale: mockLocale,
    renderPage: ({ enhanceApp }: { enhanceApp?: (app: any) => any } = {}) => {
      const App = enhanceApp
        ? enhanceApp(() => <Page>{page}</Page>)
        : () => <Page>{page}</Page>;

      return { html: renderToStaticMarkup(<App />), head: [] };
    },
  } as unknown as DocumentContext;
}

beforeEach(() => {
  mockLocale = Language.PT;
  jest.clearAllMocks();
  mockTranslate.mockImplementation(
    async (lang: string, text: string) => `[${lang}] ${text}`,
  );
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

describe("prepareSsrTranslations", () => {
  it("serves the page already translated instead of a flash of English", async () => {
    const ctx = documentContext(
      <p>
        <T>Save</T>
      </p>,
    );

    const translations = await prepareSsrTranslations(ctx);
    const { html } = await ctx.renderPage();

    expect(translations).toEqual({
      language: Language.PT,
      entries: { [key("Save")]: "[pt] Save" },
    });
    expect(html).toBe("<p>[pt] Save</p>");
  });

  it("keeps the markup around a translation, not just the text", async () => {
    const ctx = documentContext(
      <T>
        Read the <a href="#help">help</a> page
      </T>,
    );

    mockTranslate.mockResolvedValue(
      'Leia a página de <a href="#help">ajuda</a>',
    );
    const { html } = await (async () => {
      await prepareSsrTranslations(ctx);
      return ctx.renderPage();
    })();

    expect(html).toContain('<a href="#help">ajuda</a>');
  });

  it("picks up strings from useT as well as from T", async () => {
    const Field = () => <input placeholder={useT()("Password")} />;
    const ctx = documentContext(<Field />);

    await prepareSsrTranslations(ctx);
    const { html } = await ctx.renderPage();

    expect(html).toContain('placeholder="[pt] Password"');
  });

  it("honours a per-string language override on a page in another one", async () => {
    const ctx = documentContext(<T lang={Language.DE}>German</T>);

    await prepareSsrTranslations(ctx);
    const { html } = await ctx.renderPage();

    expect(html).toBe("[de] German");
  });

  it("asks for nothing on the English pages", async () => {
    mockLocale = Language.EN;
    const ctx = documentContext(<T>Save</T>);

    const translations = await prepareSsrTranslations(ctx);
    const { html } = await ctx.renderPage();

    expect(mockTranslate).not.toHaveBeenCalled();
    expect(translations.entries).toEqual({});
    expect(html).toContain("Save");
  });

  it("falls back to the client rather than failing the render", async () => {
    mockTranslate.mockRejectedValue(new Error("Gateway Timeout"));
    const ctx = documentContext(<T>Save</T>);

    const translations = await prepareSsrTranslations(ctx);
    const { html } = await ctx.renderPage();

    expect(translations.entries).toEqual({});
    expect(html).toContain("Save");
    expect(console.warn).toHaveBeenCalled();
  });

  it("collects each string once, however often it appears", async () => {
    const ctx = documentContext(
      <>
        <T>Save</T>
        <T>Save</T>
        <T>Download</T>
      </>,
    );

    await prepareSsrTranslations(ctx);

    expect(mockTranslate).toHaveBeenCalledTimes(2);
  });
});

describe("in the browser", () => {
  // The payload is read from the document once, on the first <T> rendered, so
  // it has to be in place before any of these run.
  beforeAll(() => {
    document.body.innerHTML = `<script id="${SSR_TRANSLATIONS_ID}" type="application/json">${JSON.stringify(
      { language: Language.PT, entries: { [key("Save")]: "Salvar" } },
    )}</script>`;
  });

  it("has the translation on the very first render, without waiting", () => {
    render(
      <Page>
        <T>Save</T>
      </Page>,
    );

    expect(screen.getByText("Salvar")).toBeTruthy();
  });

  it("still lets the library handle what the server never saw", async () => {
    render(
      <Page>
        <T>Download</T>
      </Page>,
    );

    expect(screen.getByText("Download")).toBeTruthy();
    expect(await screen.findByText("client:Download")).toBeTruthy();
  });
});
