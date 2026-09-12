import { ProductWithPrice } from "../types";
import { getActiveProductsWithPrices } from "../utils/supabase-client";

export const PRICING_REVALIDATE_SECONDS = 60;
export const PRICING_DEGRADED_REVALIDATE_SECONDS = 10;

let inFlight: Promise<ProductWithPrice[]> | null = null;

/**
 * Shares the in-flight promise but never the resolved value, so the 13
 * concurrent per-locale builds issue one query while ISR still refetches.
 */
function loadOnce(): Promise<ProductWithPrice[]> {
  if (!inFlight) {
    inFlight = getActiveProductsWithPrices().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
}

export interface ProductsResult {
  products: ProductWithPrice[];
  degraded: boolean;
}

/**
 * Never throws: a Supabase timeout here failed two production deploys, taking
 * ~190 unrelated pages down with /pricing.
 */
export async function loadProducts(): Promise<ProductsResult> {
  try {
    return { products: await loadOnce(), degraded: false };
  } catch (error) {
    console.warn(
      "Could not load products for /pricing:",
      error instanceof Error ? error.message : error,
    );

    return { products: [], degraded: true };
  }
}
