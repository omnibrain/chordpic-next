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
    <Box key={product.id} borderWidth="1px" borderRadius="xl" p={6} shadow="sm">
      <Box>
        <Heading size="lg" as="h2">
          Chordpic Free
        </Heading>
        <Text>Basic Chordpic features</Text>
        <Text my={6}>
          <Box as="span" fontSize="5xl">
            {priceString}
          </Box>
          <Box as="span">/{billingInterval}</Box>
        </Text>
        <Button disabled={true} size="lg" width="100%">
          Subscribe
        </Button>
      </Box>
    </Box>
  );
};
