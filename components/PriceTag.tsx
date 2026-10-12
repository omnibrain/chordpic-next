import { formatPrice } from "@/services/currency";

/**
 * Both currencies are rendered and CSS picks one, because the pricing page is
 * static and the visitor's currency is only known from a cookie.
 */
export function PriceTag({ cents }: { cents: number }) {
  return (
    <span className="text-5xl font-semibold">
      <span className="[.cur-eur_&]:hidden">{formatPrice(cents, "usd")}</span>
      <span className="hidden [.cur-eur_&]:inline">
        {formatPrice(cents, "eur")}
      </span>
    </span>
  );
}
