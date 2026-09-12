import { loadProducts } from "./products";
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

    await expect(loadProducts()).resolves.toEqual({
      products: PRODUCTS,
      degraded: false,
    });
  });

  it("degrades instead of throwing", async () => {
    mockFetch.mockRejectedValue(new Error("Gateway Timeout"));

    await expect(loadProducts()).resolves.toEqual({
      products: [],
      degraded: true,
    });
  });

  it("coalesces the concurrent per-locale calls into one query", async () => {
    mockFetch.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(PRODUCTS), 5)),
    );

    const results = await Promise.all(
      Array.from({ length: 13 }, () => loadProducts()),
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    results.forEach((result) =>
      expect(result).toEqual({ products: PRODUCTS, degraded: false }),
    );
  });

  it("shares a rejection across the coalesced callers without throwing", async () => {
    mockFetch.mockRejectedValue(new Error("Gateway Timeout"));

    const results = await Promise.all(
      Array.from({ length: 13 }, () => loadProducts()),
    );

    expect(mockFetch).toHaveBeenCalledTimes(1);
    results.forEach((result) =>
      expect(result).toEqual({ products: [], degraded: true }),
    );
  });

  it("does not cache the resolved value, so ISR still refetches", async () => {
    mockFetch.mockResolvedValue(PRODUCTS);
    await loadProducts();

    const updated = [{ id: "prod_2", name: "Pro v2" }];
    mockFetch.mockResolvedValue(updated);

    await expect(loadProducts()).resolves.toEqual({
      products: updated,
      degraded: false,
    });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it("recovers on the next call after a failure", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Gateway Timeout"));
    await expect(loadProducts()).resolves.toEqual({
      products: [],
      degraded: true,
    });

    mockFetch.mockResolvedValue(PRODUCTS);
    await expect(loadProducts()).resolves.toEqual({
      products: PRODUCTS,
      degraded: false,
    });
  });
});
