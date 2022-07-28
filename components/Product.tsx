import { Box, Button, Heading, Text, useColorMode } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useState } from "react";
import { Price, ProductWithPrice } from "../types";
import { postData } from "../utils/helpers";
import { getStripe } from "../utils/stripe-client";
import { useUser } from "../utils/useUser";

export interface ProductProps {
  billingInterval: "year" | "month";
  product: ProductWithPrice;
}

export const Product: React.FunctionComponent<
  PropsWithChildren<ProductProps>
> = ({ product, billingInterval }) => {
  const router = useRouter();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const { user, isLoading, subscription } = useUser();
  const { colorMode } = useColorMode();

  const handleCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);
    if (!user) {
      return router.push("/signin");
    }
    if (subscription) {
      return router.push("/account");
    }

    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price },
      });

      const stripe = await getStripe();
      stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      return alert((error as Error)?.message);
    } finally {
      setPriceIdLoading(undefined);
    }
  };

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
  }).format((price?.unit_amount || 0) / 100);

  return (
    <Box
      key={product.id}
      borderWidth="1px"
      borderRadius="xl"
      p={6}
      shadow="lg"
      bgGradient={
        colorMode === "dark"
          ? "linear(to-b, teal.300, purple.600)"
          : "linear(to-b, teal.100, purple.300)"
      }
    >
      <Box>
        <Heading size="lg" as="h2">
          {product.name}
        </Heading>
        <Text>{product.description}</Text>
        <Text my={6}>
          <Box as="span" fontSize="5xl">
            {priceString}
          </Box>
          <Box as="span">/{billingInterval}</Box>
        </Text>
        <Button
          disabled={isLoading}
          isLoading={priceIdLoading === price.id}
          onClick={() => handleCheckout(price)}
          size="lg"
          width="100%"
        >
          {product.name === subscription?.prices?.products?.name
            ? "Manage"
            : "Subscribe"}
        </Button>
      </Box>
    </Box>
  );
};
