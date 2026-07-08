import { useRouter } from "next/router";
import React, { PropsWithChildren, useState } from "react";
import { GA4_ID } from "../global";
import { Price, ProductWithPrice } from "../types";
import { postData } from "../utils/helpers";
import { getStripe } from "../utils/stripe-client";
import { useUser } from "../utils/useUser";
import * as Sentry from "@sentry/nextjs";
import { GA } from "../services/google-analytics";
import { Spinner } from "./ui/Spinner";

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
        data: { price, analyticsClientId },
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
    <div
      key={product.id}
      className="cursor-pointer rounded-2xl border border-zinc-900 bg-zinc-900 p-6 text-white shadow-lg transition-transform hover:-translate-y-0.5 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
      onClick={() => handleCheckout(price)}
    >
      <h2 className="font-heading text-2xl font-semibold">{product.name}</h2>
      <p className="mt-3 text-zinc-300 dark:text-zinc-600">
        {product.description}
      </p>
      <p className="my-6">
        <span className="text-5xl font-semibold">{priceString}</span>
        <span className="text-zinc-300 dark:text-zinc-600">
          /{billingInterval}
        </span>
      </p>
      <button
        disabled={isLoading || priceIdLoading === price.id}
        className="inline-flex h-12 w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-white px-6 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-200 disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-700"
      >
        {priceIdLoading === price.id && <Spinner className="h-4 w-4" />}
        {product.name === subscription?.prices?.products?.name
          ? "Manage"
          : "Subscribe"}
      </button>
    </div>
  );
};
