import { amountIn, formatPrice } from "@/services/currency";
import { Price } from "../types";

/**
 * Every currency is rendered and CSS picks one, because the pricing page is
 * static and the visitor's currency is only known from a cookie. A currency the
 * price has no option for shows the default, since that is what Checkout charges.
 */
export function PriceTag({ price }: { price: Price }) {
  const fallback = formatPrice(price.unit_amount || 0, price.currency || "usd");
  const show = (currency: "eur" | "chf") => {
    const amount = amountIn(price, currency);
    return amount === null ? fallback : formatPrice(amount, currency);
  };

  return (
    <span className="text-5xl font-semibold">
      <span className="[.cur-chf_&]:hidden [.cur-eur_&]:hidden">
        {fallback}
      </span>
      <span className="hidden [.cur-eur_&]:inline">{show("eur")}</span>
      <span className="hidden [.cur-chf_&]:inline">{show("chf")}</span>
    </span>
  );
}
