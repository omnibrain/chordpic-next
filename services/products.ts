import { ProductWithPrice } from "../types";
import { getActiveProductsWithPrices } from "../utils/supabase-client";

/**
 * Long enough to outlast a cold start on the nano instance, not just a blip:
 * the timeouts show up in bursts and clear on the next deploy, and the build
 * can afford ~17s far more easily than a lost deploy.
 */
export const RETRY_DELAYS_MS = [2_000, 5_000, 10_000];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(): Promise<ProductWithPrice[]> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await getActiveProductsWithPrices();
    } catch (error) {
      const wait = RETRY_DELAYS_MS[attempt];

      if (wait === undefined) {
        throw error;
      }

      console.warn(
        `Loading products for /pricing failed, retrying in ${wait}ms:`,
        error instanceof Error ? error.message : error,
      );
      await delay(wait);
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
