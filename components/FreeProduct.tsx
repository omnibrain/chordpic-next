import { Box, Button, Heading, Text } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";
import { ProductWithPrice } from "../types";
import { T } from '@magic-translate/react'

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
    <Box key={product.id} shadow="md" border="2px" borderRadius="lg" p={6}>
      <Box>
        <Heading size="lg" as="h2">
          Chordpic Free
        </Heading>
        <Text mt={3}><T>Basic Chordpic features</T></Text>
        <Text my={6}>
          <Box as="span" fontSize="5xl">
            {priceString}
          </Box>
          <Box as="span">/<T>{billingInterval}</T></Box>
        </Text>
      </Box>
    </Box>
  );
};
