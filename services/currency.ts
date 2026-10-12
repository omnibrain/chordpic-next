/**
 * Stripe Checkout charges visitors in the euro area in EUR (the prices carry
 * EUR currency_options at the same amounts as USD), so the pricing page shows
 * the same currency they will be asked to pay in.
 *
 * Shared by proxy.ts and the browser, so it must stay free of DOM and Node APIs.
 */
export const CURRENCY_COOKIE = "cp_cur";

export type Currency = "usd" | "eur";

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

export function currencyForCountry(country: string | null): Currency {
  return country && EURO_AREA.has(country.toUpperCase()) ? "eur" : "usd";
}

export function formatPrice(cents: number, currency: Currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
  }).format(cents / 100);
}
