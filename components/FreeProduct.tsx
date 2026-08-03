import React, { PropsWithChildren } from "react";
import { ProductWithPrice } from "../types";
import { T } from "@magic-translate/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
    <Card key={product.id}>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Chordpic Free</CardTitle>
        <CardDescription>
          <T>Basic Chordpic features</T>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-5xl font-semibold">{priceString}</span>
        <span className="text-muted-foreground">
          /<T>{billingInterval}</T>
        </span>
      </CardContent>
    </Card>
  );
};
