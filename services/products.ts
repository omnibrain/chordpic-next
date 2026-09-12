import { backOff, BackoffOptions } from "exponential-backoff";
import { ProductWithPrice } from "../types";
import { getActiveProductsWithPrices } from "../utils/supabase-client";

export const NUM_OF_ATTEMPTS = 4;

/**
 * Sized for a cold start on the nano instance rather than a blip: the timeouts
 * arrive in a burst and clear on the very next deploy.
 */
export const RETRY_OPTIONS: BackoffOptions = {
  numOfAttempts: NUM_OF_ATTEMPTS,
  startingDelay: 2_000,
  timeMultiple: 2.5,
  jitter: "full",
  retry: (error: unknown, attemptNumber: number) => {
    const message = error instanceof Error ? error.message : error;

    // Called on the final failure too, just before backOff gives up.
    if (attemptNumber >= NUM_OF_ATTEMPTS) {
      console.error(
        `Loading products for /pricing failed after ${attemptNumber} attempts:`,
        message,
      );
    } else {
      console.warn(
        `Loading products for /pricing failed (attempt ${attemptNumber}/${NUM_OF_ATTEMPTS}), retrying:`,
        message,
      );
    }

    return true;
  },
};

/**
 * Throws rather than falling back to an empty list: that would be baked into
 * the static HTML, and ISR only regenerates on the next request, so a
 * low-traffic locale could serve a pricing page with no prices for hours.
 */
export function loadProducts(): Promise<ProductWithPrice[]> {
  return backOff(getActiveProductsWithPrices, RETRY_OPTIONS);
}
