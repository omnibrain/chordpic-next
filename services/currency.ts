/**
 * Stripe Checkout charges visitors in the euro area in EUR and in Switzerland
 * in CHF (via the prices' currency_options), so the pricing page shows the
 * same currency they will be asked to pay in.
 *
 * Shared by proxy.ts and the browser, so it must stay free of DOM and Node APIs.
 */
export const CURRENCY_COOKIE = "cp_cur";

export type Currency = "usd" | "eur" | "chf";

const EURO_AREA = new Set([
  "AT",
  "BE",
  "HR",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
  // Use the euro without being members.
  "AD",
  "MC",
  "SM",
  "VA",
  "ME",
  "XK",
]);

const FRANC_AREA = new Set(["CH", "LI"]);

export function currencyForCountry(country: string | null): Currency {
  const code = country?.toUpperCase() ?? "";
  if (EURO_AREA.has(code)) return "eur";
  if (FRANC_AREA.has(code)) return "chf";
  return "usd";
}

/**
 * The price in a given currency, or null when Stripe has no option for it —
 * Checkout then falls back to the default currency.
 */
export function amountIn(
  price: {
    currency?: string;
    unit_amount?: number;
    currency_options?: Partial<Record<string, number>> | null;
  },
  currency: string,
): number | null {
  return (
    price.currency_options?.[currency] ??
    (price.currency === currency ? price.unit_amount ?? null : null)
  );
}

export function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
