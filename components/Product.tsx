import { Box, Button, Heading, Text, useColorMode } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useState } from "react";
import { GA4_ID } from "../global";
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

    let analyticsClientId: string | null = null;
    if (gtag) {
      await new Promise((resolve) =>
        gtag("event", "begin_checkout", {
          event_callback: resolve,
        })
      );

      analyticsClientId = await new Promise<string | null>((resolve) =>
        gtag("get", GA4_ID, "client_id", (cid) => {
          if (typeof cid === "string") {
            resolve(cid);
          }
          resolve(null);
        })
      );
    }

    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price, analyticsClientId },
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
      borderWidth={colorMode === "dark" ? undefined : "2px"}
      borderRadius="xl"
      p={6}
      shadow="lg"
      borderColor="black"
      bgGradient={
        colorMode === "dark"
          ? "linear(to-b, teal.300, purple.600)"
          : "linear(to-b, teal.100, purple.300)"
      }
      onClick={() => handleCheckout(price)}
      cursor="pointer"
    >
      <Box>
        <Heading size="lg" as="h2">
          {product.name}
        </Heading>
        <Text mt={3}>{product.description}</Text>
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
          colorScheme="gray"
        >
          {product.name === subscription?.prices?.products?.name
            ? "Manage"
            : "Subscribe"}
        </Button>
      </Box>
    </Box>
  );
};
