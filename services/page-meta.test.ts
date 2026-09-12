import { localizedMeta } from "./page-meta";
import { translate } from "../utils/translate";

jest.mock("../utils/translate", () => ({
  translate: jest.fn(),
}));

const mockTranslate = translate as jest.MockedFunction<typeof translate>;

describe("localizedMeta", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("translates both fields for a non-English locale", async () => {
    mockTranslate.mockImplementation(async (_lang, text) => `es:${text}`);

    await expect(
      localizedMeta("es", { title: "Help", description: "How to." }),
    ).resolves.toEqual({ title: "es:Help", description: "es:How to." });
  });

  it("does not call the API for English", async () => {
    const meta = { title: "Help", description: "How to." };

    await expect(localizedMeta("en", meta)).resolves.toEqual(meta);
    await expect(localizedMeta(undefined, meta)).resolves.toEqual(meta);
    expect(mockTranslate).not.toHaveBeenCalled();
  });

  it("leaves description absent rather than undefined", async () => {
    // Layout spreads these over its defaults, so an explicit `undefined` would
    // blank the default description instead of falling back to it.
    mockTranslate.mockImplementation(async (_lang, text) => `de:${text}`);

    const result = await localizedMeta("de", { title: "Terms of Use" });

    expect(result).toEqual({ title: "de:Terms of Use" });
    expect("description" in result).toBe(false);
    expect(mockTranslate).toHaveBeenCalledTimes(1);
  });

  it("falls back to English instead of failing the build", async () => {
    mockTranslate.mockRejectedValue(new Error("Gateway Timeout"));
    const meta = { title: "Help", description: "How to." };

    await expect(localizedMeta("es", meta)).resolves.toEqual(meta);
  });

  it("keeps the English string if the provider answers empty", async () => {
    mockTranslate.mockResolvedValue("");
    const meta = { title: "Help", description: "How to." };

    await expect(localizedMeta("es", meta)).resolves.toEqual(meta);
  });
});
