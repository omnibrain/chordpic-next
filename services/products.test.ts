import { loadProducts, NUM_OF_ATTEMPTS } from "./products";
import { getActiveProductsWithPrices } from "../utils/supabase-client";

jest.mock("../utils/supabase-client", () => ({
  getActiveProductsWithPrices: jest.fn(),
}));

const mockFetch = getActiveProductsWithPrices as jest.MockedFunction<
  typeof getActiveProductsWithPrices
>;

const PRODUCTS = [{ id: "prod_1", name: "Pro" }];

describe("loadProducts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
    // Run the backoff instantly; the delays themselves are not under test.
    jest
      .spyOn(global, "setTimeout")
      .mockImplementation(((fn: () => void) => fn()) as never);
  });

  it("returns the products when Supabase answers", async () => {
    mockFetch.mockResolvedValue(PRODUCTS);

    await expect(loadProducts()).resolves.toEqual(PRODUCTS);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("rides out a transient failure", async () => {
    mockFetch
      .mockRejectedValueOnce(new Error("Gateway Timeout"))
      .mockResolvedValue(PRODUCTS);

    await expect(loadProducts()).resolves.toEqual(PRODUCTS);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("throws once the attempts are exhausted, rather than shipping no prices", async () => {
    mockFetch.mockRejectedValue(new Error("Gateway Timeout"));

    await expect(loadProducts()).rejects.toThrow("Gateway Timeout");
    expect(mockFetch).toHaveBeenCalledTimes(NUM_OF_ATTEMPTS);
  });

  it("logs the give-up at error level, not as another retry", async () => {
    mockFetch.mockRejectedValue(new Error("Gateway Timeout"));

    await expect(loadProducts()).rejects.toThrow();

    expect(console.warn).toHaveBeenCalledTimes(NUM_OF_ATTEMPTS - 1);
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining(`failed after ${NUM_OF_ATTEMPTS} attempts`),
      "Gateway Timeout",
    );
  });

  it("fetches fresh on every call, so ISR revalidation is not stuck", async () => {
    mockFetch.mockResolvedValue(PRODUCTS);
    await loadProducts();

    const updated = [{ id: "prod_2", name: "Pro v2" }];
    mockFetch.mockResolvedValue(updated);

    await expect(loadProducts()).resolves.toEqual(updated);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
