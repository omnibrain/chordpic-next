import React, { PropsWithChildren } from "react";
import { ProductWithPrice } from "../types";
import { T } from "@magic-translate/react";

export interface FreeProductProps {
  billingInterval: "year" | "month";
  product: ProductWithPrice;
}

export const FreeProduct: React.FunctionComponent<
  PropsWithChildren<FreeProductProps>
> = ({ product, billingInterval }) => {
  const price = product?.prices?.find(
    (price) => price.interval === billingInterval
  );

  if (!price) {
    return null;
  }

  const priceString = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price.currency,
    minimumFractionDigits: 0,
  }).format(0);

  return (
    <div
      key={product.id}
      className="rounded-2xl border border-zinc-200 p-6 shadow-sm dark:border-zinc-800"
    >
      <h2 className="font-heading text-2xl font-semibold">Chordpic Free</h2>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        <T>Basic Chordpic features</T>
      </p>
      <p className="my-6">
        <span className="text-5xl font-semibold">{priceString}</span>
        <span className="text-zinc-500">
          /<T>{billingInterval}</T>
        </span>
      </p>
    </div>
  );
};
