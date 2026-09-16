import { createPageMetadata } from "./app-metadata";
import { translate } from "../utils/translate";
import { PUBLIC_LOCALES, SITE_URL } from "./seo";

jest.mock("../utils/translate", () => ({
  ...jest.requireActual("../utils/translate"),
  translate: jest.fn(),
}));

const mockTranslate = translate as jest.MockedFunction<typeof translate>;

beforeEach(() => {
  mockTranslate.mockReset();
});

it("keeps translated titles and descriptions consistent across search and social cards", async () => {
  mockTranslate.mockImplementation(
    async (language, text) => `${language}:${text}`,
  );

  const metadata = await createPageMetadata("es", "/news?ref=test#latest", {
    title: "News",
    description: "Updates from ChordPic.",
  });

  expect(metadata.title).toBe("ChordPic | es:News");
  expect(metadata.description).toBe("es:Updates from ChordPic.");
  expect(metadata.openGraph).toMatchObject({
    title: metadata.title,
    description: metadata.description,
    url: `${SITE_URL}/es/news`,
    images: [`${SITE_URL}/logo.png`],
  });
  expect(metadata.twitter).toMatchObject({
    card: "summary_large_image",
    title: metadata.title,
    description: metadata.description,
    images: [`${SITE_URL}/logo.png`],
  });
  expect(metadata.robots).toEqual({ index: true, follow: true });
});

it("includes a self-referencing hreflang cluster and an unprefixed English canonical", async () => {
  const metadata = await createPageMetadata("en", "/help");

  expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/help`);
  expect(Object.keys(metadata.alternates?.languages ?? {})).toEqual([
    ...PUBLIC_LOCALES,
    "x-default",
  ]);
  expect(metadata.alternates?.languages).toMatchObject({
    en: `${SITE_URL}/help`,
    de: `${SITE_URL}/de/help`,
    "x-default": `${SITE_URL}/help`,
  });
  expect(mockTranslate).not.toHaveBeenCalled();
});

it.each(["/account", "/signin", "/new-password", "/chord/shared-data"])(
  "keeps %s noindex without canonical or hreflang URLs",
  async (path) => {
    const metadata = await createPageMetadata("en", path);

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).not.toHaveProperty("url");
  },
);

it("retains the legal pages' default description when only their title is supplied", async () => {
  const metadata = await createPageMetadata("en", "/terms", {
    title: "Terms of Use",
  });

  expect(metadata.title).toBe("ChordPic | Terms of Use");
  expect(metadata.description).toBe(
    "It has never been easier to create beautiful chord diagrams.",
  );
});
