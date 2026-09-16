/** @jest-environment node */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import NewsPage from "../app/[locale]/news/page";
import { translate } from "../utils/translate";

jest.mock("../utils/translate", () => ({ translate: jest.fn() }));
jest.mock("../components/LocalizedLink", () => ({
  __esModule: true,
  default: (props: React.ComponentProps<"a">) =>
    React.createElement("a", props),
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => React.createElement("img", { alt }),
}));

const mockTranslate = jest.mocked(translate);

// Resolve async Server Components before using React 18's synchronous test
// renderer. The real Magic Translate components run; only the API is mocked.
async function resolveServerTree(
  node: React.ReactNode,
): Promise<React.ReactNode> {
  if (Array.isArray(node)) return Promise.all(node.map(resolveServerTree));
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return node;
  if (typeof node.type === "function") {
    const Component = node.type as React.FunctionComponent;
    return resolveServerTree(await Component(node.props));
  }
  return React.cloneElement(node, {
    children: await resolveServerTree(node.props.children),
  });
}

async function renderNews(locale: string) {
  const page = await NewsPage({ params: Promise.resolve({ locale }) });
  return renderToStaticMarkup(<>{await resolveServerTree(page)}</>);
}

beforeEach(() => mockTranslate.mockReset());

it("renders localized article text, rich markup and image descriptions on the server", async () => {
  mockTranslate.mockImplementation(
    async (language, text) => `${language}:${text}`,
  );
  const html = await renderNews("de");

  expect(html).toContain("<h1>de:News</h1>");
  expect(html).toContain("de:Read about new features");
  expect(html).toContain('alt="de:Chord diagram with fret markers"');
  expect(html.match(/alt="de:Example horizontal chord"/g)).toHaveLength(2);
  expect(html).toContain(
    '<a href="/languages" style="text-decoration:underline">',
  );
  expect(html).toContain("de:Choose your language here.");
  expect(html).toContain("<strong>you</strong>");
  expect(html).toContain('<ul style="margin-bottom:1rem">');
  expect(html).toContain('href="https://youtu.be/_pu4vOEdpwM"');
  expect(
    mockTranslate.mock.calls.every(([language]) => language === "de"),
  ).toBe(true);
});

it("renders English without translation requests", async () => {
  const html = await renderNews("en");
  expect(html).toContain("<h1>News</h1>");
  expect(html).toContain('alt="Chord diagram with fret markers"');
  expect(mockTranslate).not.toHaveBeenCalled();
});

it("keeps source content when the translation provider answers empty", async () => {
  mockTranslate.mockResolvedValue("");
  const html = await renderNews("fr");
  expect(html).toContain("<h1>News</h1>");
  expect(html).toContain("Read about new features");
  expect(html).toContain('alt="Chord diagram with fret markers"');
});

it("keeps concurrent locale renders independent", async () => {
  mockTranslate.mockImplementation(
    async (language, text) => `${language}:${text}`,
  );
  const [german, french] = await Promise.all([
    renderNews("de"),
    renderNews("fr"),
  ]);
  expect(german).toContain("<h1>de:News</h1>");
  expect(german).not.toContain("fr:News");
  expect(french).toContain("<h1>fr:News</h1>");
  expect(french).not.toContain("de:News");
});
