/** @jest-environment node */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import About from "../app/[locale]/about/page-content";
import Languages from "../app/[locale]/languages/page-content";
import Pricing from "../components/Pricing";
import { translate } from "../utils/translate";
import { localizePathname } from "./i18n";

jest.mock("../utils/translate", () => ({
  ...jest.requireActual("../utils/translate"),
  translate: jest.fn(),
}));
jest.mock("../components/LocalizedLink", () => ({
  __esModule: true,
  default: ({
    href,
    locale = "de",
    children,
  }: {
    href: string;
    locale?: string;
    children: React.ReactNode;
  }) => <a href={localizePathname(href, locale)}>{children}</a>,
}));
jest.mock("../components/ui/tabs", () => {
  const Slot = ({ children }: React.PropsWithChildren) => <div>{children}</div>;
  return { Tabs: Slot, TabsList: Slot, TabsTrigger: Slot, TabsContent: Slot };
});
jest.mock("../components/Product", () => ({
  Product: ({
    product,
    labels,
    billingInterval,
  }: import("../components/Product").ProductProps) => (
    <div data-product={product.id}>
      {product.name}|{labels.description}|{labels[billingInterval]}|
      {labels.subscribe}|{labels.manage}
    </div>
  ),
}));

const mockTranslate = jest.mocked(translate);

async function resolveServerTree(
  node: React.ReactNode,
): Promise<React.ReactNode> {
  if (Array.isArray(node))
    return React.Children.toArray(
      await Promise.all(node.map(resolveServerTree)),
    );
  if (!React.isValidElement<{ children?: React.ReactNode }>(node)) return node;
  if (typeof node.type === "function") {
    const Component = node.type as React.FunctionComponent;
    return resolveServerTree(await Component(node.props));
  }
  return React.cloneElement(node, {
    children: await resolveServerTree(node.props.children),
  });
}

async function render(node: React.ReactNode) {
  return renderToStaticMarkup(<>{await resolveServerTree(node)}</>);
}

beforeEach(() => {
  mockTranslate.mockReset();
  mockTranslate.mockImplementation(
    async (language, text) => `${language}:${text}`,
  );
});

it("renders About text and rich links in the server response", async () => {
  const html = await render(<About locale="de" />);
  expect(html).toContain("<h1>de:About</h1>");
  expect(html).toContain("de:ChordPic is a completely free tool");
  expect(html).toContain('href="https://gitlab.com/Voellmy/chordpic/issues"');
  expect(html).toContain('href="/de/privacy-notice"');
  expect(html).toContain('href="/cookie-policy"');
});

it("renders the Languages body in the page locale and each language name in its own locale", async () => {
  const html = await render(<Languages locale="pt" />);
  expect(html).toContain("<h1>pt:Languages</h1>");
  expect(html).toContain("pt:ChordPic is currently available");
  expect(html).toContain('<a href="/de">de:German</a>');
  expect(html).toContain('<a href="/">English</a>');
  expect(html).toContain('href="https://magictranslate.io"');
});

it("renders pricing text and supplies translated labels without changing checkout product identity", async () => {
  const product = {
    id: "prod_example",
    name: "Chordpic Pro",
    description: "Unlock all features",
    prices: [
      {
        id: "price_month",
        interval: "month" as const,
        currency: "usd",
        unit_amount: 400,
      },
      {
        id: "price_year",
        interval: "year" as const,
        currency: "usd",
        unit_amount: 4000,
      },
    ],
  };
  const html = await render(
    await Pricing({ products: [product], locale: "fr" }),
  );
  expect(html).toContain("fr:Pricing Plans");
  expect(html).toContain("fr:Monthly billing");
  expect(html).toContain("fr:Yearly billing");
  expect(html).toContain("fr:Basic Chordpic features");
  expect(html).toContain(
    "Chordpic Pro|fr:Unlock all features|fr:month|fr:Subscribe|fr:Manage",
  );
  expect(html).toContain(
    "Chordpic Pro|fr:Unlock all features|fr:year|fr:Subscribe|fr:Manage",
  );
  expect(product.name).toBe("Chordpic Pro");
});

it("skips requests for English and retains source text for empty translations", async () => {
  expect(await render(<About locale="en" />)).toContain("<h1>About</h1>");
  expect(mockTranslate).not.toHaveBeenCalled();
  mockTranslate.mockResolvedValue("");
  expect(await render(<About locale="de" />)).toContain("<h1>About</h1>");
});
