import React, { PropsWithChildren } from "react";
import { PriceTag } from "./PriceTag";
import { Price, ProductWithPrice } from "../types";
import { serverTranslate } from "@/services/server-translate";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FREE: Price = {
  id: "free",
  currency: "usd",
  unit_amount: 0,
  currency_options: { eur: 0, chf: 0 },
};

export interface FreeProductProps {
  billingInterval: "year" | "month";
  product: ProductWithPrice;
  locale: string;
}

export const FreeProduct: React.FunctionComponent<
  PropsWithChildren<FreeProductProps>
> = ({ product, billingInterval, locale }) => {
  const { T } = serverTranslate(locale);
  const price = product?.prices?.find(
    (price) => price.interval === billingInterval,
  );

  if (!price) {
    return null;
  }

  return (
    <Card key={product.id}>
      <CardHeader>
        <CardTitle className="font-heading text-2xl">Chordpic Free</CardTitle>
        <CardDescription>
          <T>Basic Chordpic features</T>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <PriceTag price={FREE} />
        <span className="text-muted-foreground">
          /<T>{billingInterval}</T>
        </span>
      </CardContent>
    </Card>
  );
};
