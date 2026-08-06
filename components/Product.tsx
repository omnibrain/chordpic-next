import { useRouter } from "next/router";
import React, { PropsWithChildren, useState } from "react";
import { GA4_ID } from "../global";
import { Price, ProductWithPrice } from "../types";
import { postData } from "../utils/helpers";
import { getStripe } from "../utils/stripe-client";
import { useUser } from "../utils/useUser";
import * as Sentry from "@sentry/nextjs";
import { GA } from "../services/google-analytics";
import { getRewardfulReferral } from "../services/rewardful";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export interface ProductProps {
  billingInterval: "year" | "month";
  product: ProductWithPrice;
}

// const wait = <T>(ms: number, returnValue?: T) => new Promise((resolve) => setTimeout(resolve, ms));

function wait<T>(ms: number, returnValue: T): Promise<T> {
  return new Promise<T>((resolve) =>
    setTimeout(() => resolve(returnValue), ms),
  );
}

export const Product: React.FunctionComponent<
  PropsWithChildren<ProductProps>
> = ({ product, billingInterval }) => {
  const router = useRouter();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const { user, isLoading, subscription } = useUser();

  const handleCheckout = async (price: Price) => {
    console.debug("handling checkout");
    setPriceIdLoading(price.id);

    if (!user) {
      return router.push("/signin");
    }
    if (subscription) {
      return router.push("/account");
    }

    const gaTimeout = 1000; // 1 seconds
    let analyticsClientId: string | null = null;

    console.debug("try fetching GA client_id");
    try {
      await Promise.race([
        new Promise(
          (resolve) =>
            GA()?.("event", "begin_checkout", {
              event_callback: resolve,
            }),
        ),
        wait(gaTimeout, null),
      ]);
      console.debug("finished first race");

      analyticsClientId = await Promise.race([
        new Promise<string | null>(
          (resolve) =>
            GA()?.("get", GA4_ID, "client_id", (cid) => {
              if (typeof cid === "string") {
                resolve(cid);
              }
              resolve(null);
            }),
        ),
        wait(gaTimeout, null),
      ]);
      console.debug("finished second race", { analyticsClientId });
    } catch (err) {
      console.debug("failed to fetch GA client_id", err);
      Sentry.captureException(err, {
        extra: {
          gaDefined: typeof gtag !== "undefined",
          analyticsClientId,
        },
      });
      Sentry.captureMessage(
        `Failed to track checkout: ${err instanceof Error ? err.message : err}`,
      );
    }

    try {
      console.debug("creating checkout session");
      const { sessionId } = await postData({
        url: "/api/create-checkout-session",
        data: { price, analyticsClientId, referral: getRewardfulReferral() },
      });

      console.debug(`got session id: ${sessionId}`);
      const stripe = await getStripe();

      if (!stripe) {
        console.debug("Stripe was not defined during checkout");
        Sentry.captureMessage("Stripe was not defined during checkout");
        return;
      }

      stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.debug("checkout failed", error);
      Sentry.captureException(error, {
        extra: {
          gaDefined: typeof gtag !== "undefined",
          analyticsClientId,
        },
      });
      Sentry.captureMessage(
        `Error creating Stripe checkout session: ${
          error instanceof Error ? error.message : error
        }`,
      );
    } finally {
      setPriceIdLoading(undefined);
    }
  };

  const price = product?.prices?.find(
    (price) => price.interval === billingInterval,
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
    <Card
      key={product.id}
      className="cursor-pointer border-primary shadow-lg transition-transform hover:-translate-y-0.5"
      onClick={() => handleCheckout(price)}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-heading text-2xl">
          {product.name}
          <Badge>Pro</Badge>
        </CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <span className="text-5xl font-semibold">{priceString}</span>
        <span className="text-muted-foreground">/{billingInterval}</span>
      </CardContent>
      <CardFooter>
        <Button
          size="lg"
          className="w-full"
          disabled={isLoading || priceIdLoading === price.id}
        >
          {priceIdLoading === price.id && <Loader2 className="animate-spin" />}
          {product.name === subscription?.prices?.products?.name
            ? "Manage"
            : "Subscribe"}
        </Button>
      </CardFooter>
    </Card>
  );
};
