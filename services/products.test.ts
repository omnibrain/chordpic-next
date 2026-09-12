import { loadProducts, MAX_ATTEMPTS } from "./products";
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

  it("throws once the retries are exhausted, rather than shipping no prices", async () => {
    mockFetch.mockRejectedValue(new Error("Gateway Timeout"));

    await expect(loadProducts()).rejects.toThrow("Gateway Timeout");
    expect(mockFetch).toHaveBeenCalledTimes(MAX_ATTEMPTS);
  });

  it("coalesces the concurrent per-locale calls into one query", async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(PRODUCTS), 5)),
    );

    const results = await Promise.all(
      Array.from({ length: 13 }, () => loadProducts()),
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    results.forEach((result) => expect(result).toEqual(PRODUCTS));
  });

  it("rejects every coalesced caller when the query fails", async () => {
    mockFetch.mockRejectedValue(new Error("Gateway Timeout"));

    const results = await Promise.allSettled(
      Array.from({ length: 13 }, () => loadProducts()),
    );

    expect(mockFetch).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    results.forEach((result) => expect(result.status).toBe("rejected"));
  });

  it("does not cache the resolved value, so ISR still refetches", async () => {
    mockFetch.mockResolvedValue(PRODUCTS);
    await loadProducts();

    const updated = [{ id: "prod_2", name: "Pro v2" }];
    mockFetch.mockResolvedValue(updated);

    await expect(loadProducts()).resolves.toEqual(updated);
  });
});
