/** @jest-environment node */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import HelpPage from "../app/[locale]/help/page";
import { translate } from "../utils/translate";

jest.mock("../utils/translate", () => ({ translate: jest.fn() }));
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

async function renderHelp(locale: string) {
  const page = await HelpPage({ params: Promise.resolve({ locale }) });
  return renderToStaticMarkup(<>{await resolveServerTree(page)}</>);
}

beforeEach(() => mockTranslate.mockReset());

it("renders localized article text, rich markup and image descriptions on the server", async () => {
  mockTranslate.mockImplementation(
    async (language, text) => `${language}:${text}`,
  );
  const html = await renderHelp("de");

  expect(html).toContain("<h1>de:Help</h1>");
  expect(html).toContain("de:If you haven");
  expect(html).toContain('<h2 id="the-editor">de:The Editor</h2>');
  expect(html).toContain(
    '<h2 id="the-result-section">de:The Result Section</h2>',
  );
  expect(html).toContain('<h2 id="the-download-sharing-section">');
  expect(html).toContain("<strong>Adding / removing fingers</strong>");
  expect(html).toContain("<em>Editor</em>");
  expect(html).toContain("<em>in that link</em>");
  const descriptions = [
    "Example of adding and removing fingers",
    "Example of toggling strings from do not play to open",
    "Example of adding and removing a barre chord",
    "Example of adding and editing text on fingers and barre chords",
    "Example of changing colors of fingers and barre chords",
    "Example of changing the shape of a finger",
    "Example of adding labels to strings",
    "Example chord chart",
  ];
  descriptions.forEach((description) => {
    expect(html).toContain(`alt="de:${description}"`);
  });
  expect(html.match(/<img /g)).toHaveLength(8);
  expect(
    mockTranslate.mock.calls.every(([language]) => language === "de"),
  ).toBe(true);
});

it("renders English without translation requests", async () => {
  const html = await renderHelp("en");
  expect(html).toContain("<h1>Help</h1>");
  expect(html).toContain('alt="Example of adding and removing fingers"');
  expect(mockTranslate).not.toHaveBeenCalled();
});

it("keeps source content when the translation provider answers empty", async () => {
  mockTranslate.mockResolvedValue("");
  const html = await renderHelp("fr");
  expect(html).toContain("<h1>Help</h1>");
  expect(html).toContain("If you haven");
  expect(html).toContain('alt="Example of adding and removing fingers"');
});

it("keeps concurrent locale renders independent", async () => {
  mockTranslate.mockImplementation(
    async (language, text) => `${language}:${text}`,
  );
  const [german, french] = await Promise.all([
    renderHelp("de"),
    renderHelp("fr"),
  ]);
  expect(german).toContain("<h1>de:Help</h1>");
  expect(german).not.toContain("fr:Help");
  expect(french).toContain("<h1>fr:Help</h1>");
  expect(french).not.toContain("de:Help");
});
