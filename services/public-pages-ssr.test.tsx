/** @jest-environment node */

import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { compressToEncodedURIComponent } from "lz-string";
import About from "../app/[locale]/about/page-content";
import SharedChord from "../app/[locale]/chord/[data]/page";
import LandingIntro from "../app/[locale]/landing-intro";
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
jest.mock("../app/[locale]/chord/[data]/chord-view", () => ({
  __esModule: true,
  default: ({
    diagram,
    editHeading,
    editLabel,
  }: import("../app/[locale]/chord/[data]/chord-view").ChordViewProps) => (
    <div data-edit={`${editHeading}|${editLabel}`}>
      <div dangerouslySetInnerHTML={{ __html: diagram?.svg ?? "" }} />
    </div>
  ),
}));
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

it("renders the landing headline and lead in the server response", async () => {
  const html = await render(<LandingIntro locale="es" />);
  expect(html).toContain("es:Guitar Chord Diagram Creator");
  expect(html).toContain("es:It&#x27;s never been easier");
  expect(html).toContain("es:Get the Pro version (no ads, no watermark)");
  expect(html).toContain("es:Get the Pro version (no watermark)");
  expect(html).toContain('href="#editor"');
  expect(html).toContain('href="#result"');
  expect(html).toContain('/pricing"');
});

it("renders a shared chord as SVG in the server response, with translated labels", async () => {
  const data = compressToEncodedURIComponent(
    JSON.stringify({
      chord: { fingers: [[1, 2]], barres: [] },
      settings: { frets: 4, strings: 6, title: "Am" },
    }),
  );
  const html = await render(
    await SharedChord({
      params: Promise.resolve({ locale: "de", data: data }),
    }),
  );

  expect(html).toContain("<svg");
  expect(html).toContain(">Am</tspan>");
  expect(html).toContain('data-edit="de:Edit|de:Edit this chord diagram"');
});

it("reads a chart whose compressed form contains a plus sign", async () => {
  // The route percent-encodes the segment, so lz-string's `+` arrives as %2B.
  const data = compressToEncodedURIComponent(
    JSON.stringify({
      chord: { fingers: [[1, 2]], barres: [] },
      settings: { frets: 4, strings: 6, title: "serfj" },
    }),
  );
  expect(data).toContain("+");

  const html = await render(
    await SharedChord({
      params: Promise.resolve({
        locale: "de",
        data: data.replace(/\+/g, "%2B"),
      }),
    }),
  );

  expect(html).toContain(">serfj</tspan>");
});

it("explains a broken sharing link in the page locale", async () => {
  const html = await render(
    await SharedChord({
      params: Promise.resolve({ locale: "fr", data: "not-a-chord" }),
    }),
  );

  expect(html).toContain("fr:Invalid sharing link");
  expect(html).toContain("fr:Sorry but this link does not seem to be a valid");
  expect(html).toContain('href="/fr"');
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
