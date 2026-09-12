import { backOff, BackoffOptions } from "exponential-backoff";
import { ProductWithPrice } from "../types";
import { getActiveProductsWithPrices } from "../utils/supabase-client";

/**
 * Sized for a cold start on the nano instance rather than a blip: the timeouts
 * arrive in a burst and clear on the very next deploy.
 */
export const RETRY_OPTIONS: BackoffOptions = {
  numOfAttempts: 4,
  startingDelay: 2_000,
  timeMultiple: 2.5,
  jitter: "full",
  retry: (error: unknown, attemptNumber: number) => {
    console.warn(
      `Loading products for /pricing failed (attempt ${attemptNumber}), retrying:`,
      error instanceof Error ? error.message : error,
    );

    return true;
  },
};

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
    inFlight = backOff(getActiveProductsWithPrices, RETRY_OPTIONS).finally(
      () => {
        inFlight = null;
      },
    );
  }

  return inFlight;
}
