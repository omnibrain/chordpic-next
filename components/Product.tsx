import { Box, Button, Heading, Text, useColorMode } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { PropsWithChildren, useState } from "react";
import { GA4_ID } from "../global";
import { Price, ProductWithPrice } from "../types";
import { postData } from "../utils/helpers";
import { getStripe } from "../utils/stripe-client";
import { useUser } from "../utils/useUser";
import * as Sentry from "@sentry/nextjs";

export interface ProductProps {
  billingInterval: "year" | "month";
  product: ProductWithPrice;
}

// const wait = <T>(ms: number, returnValue?: T) => new Promise((resolve) => setTimeout(resolve, ms));

function wait<T>(ms: number, returnValue: T): Promise<T> {
  return new Promise<T>((resolve) =>
    setTimeout(() => resolve(returnValue), ms)
  );
}

export const Product: React.FunctionComponent<
  PropsWithChildren<ProductProps>
> = ({ product, billingInterval }) => {
  const router = useRouter();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const { user, isLoading, subscription } = useUser();
  const { colorMode } = useColorMode();

  const handleCheckout = async (price: Price) => {
    const scope = new Sentry.Scope();

    setPriceIdLoading(price.id);

    if (!user) {
      return router.push("/signin");
    }
    if (subscription) {
      return router.push("/account");
    }

    const gaTimeout = 2000; // 2 seconds
    let analyticsClientId: string | null = null;

    try {
      if (typeof gtag !== "undefined") {
        await Promise.race([
          await new Promise((resolve) =>
            gtag?.("event", "begin_checkout", {
              event_callback: resolve,
            })
          ),
          wait(gaTimeout, null),
        ]);

        analyticsClientId = await Promise.race([
          new Promise<string | null>((resolve) =>
            gtag?.("get", GA4_ID, "client_id", (cid) => {
              if (typeof cid === "string") {
                resolve(cid);
              }
              resolve(null);
            })
          ),
          wait(gaTimeout, null),
        ]);
      }
    } catch (err) {
      Sentry.captureException(err, {
        extra: {
          gaDefined: typeof gtag !== "undefined",
          analyticsClientId
        }
      });
      Sentry.captureMessage(`Failed to track checkout: ${
        err instanceof Error ? err.message : err
      }`)
    }

    try {
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price, analyticsClientId },
      });

      const stripe = await getStripe();

      if (!stripe) {
        Sentry.captureMessage("Stripe was not defined during checkout");
        return;
      }

      stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          gaDefined: typeof gtag !== "undefined",
          analyticsClientId,
        }
      });
      Sentry.captureMessage(`Error creating Stripe checkout session: ${
        error instanceof Error ? error.message : error
      }`)
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
