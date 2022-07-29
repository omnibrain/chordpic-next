import { Box, Button, Heading, Text } from "@chakra-ui/react";
import React, { PropsWithChildren } from "react";
import { ProductWithPrice } from "../types";

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
        <Text mt={3}>Basic Chordpic features</Text>
        <Text my={6}>
          <Box as="span" fontSize="5xl">
            {priceString}
          </Box>
          <Box as="span">/{billingInterval}</Box>
        </Text>
      </Box>
    </Box>
  );
};
