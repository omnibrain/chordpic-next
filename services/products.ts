import { ProductWithPrice } from "../types";
import { getActiveProductsWithPrices } from "../utils/supabase-client";

export const MAX_ATTEMPTS = 3;
export const RETRY_BASE_DELAY_MS = 500;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(): Promise<ProductWithPrice[]> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await getActiveProductsWithPrices();
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS) {
        throw error;
      }

      console.warn(
        `Loading products for /pricing failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying:`,
        error instanceof Error ? error.message : error,
      );
      await delay(RETRY_BASE_DELAY_MS * attempt);
    }
  }
}

let inFlight: Promise<ProductWithPrice[]> | null = null;

/**
 * Shares the in-flight promise but never the resolved value, so the 13
 * concurrent per-locale builds issue one query while ISR still refetches.
 *
 * Deliberately still throws once the retries are exhausted: an empty product
 * list would be baked into the static HTML, and ISR only regenerates on the
 * next request, so a low-traffic locale could serve a pricing page with no
 * prices for hours.
 */
export function loadProducts(): Promise<ProductWithPrice[]> {
  if (!inFlight) {
    inFlight = fetchWithRetry().finally(() => {
      inFlight = null;
    });
  }

  return inFlight;
}
