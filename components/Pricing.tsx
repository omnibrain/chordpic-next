import { useState } from "react";
import { ProductWithPrice } from "../types";
import { FreeProduct } from "./FreeProduct";
import { Product } from "./Product";
import { T } from "@magic-translate/react";

interface Props {
  products: ProductWithPrice[];
}

type BillingInterval = "month" | "year";

export default function Pricing({ products }: Props) {
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("month");

  return (
    <section>
      <h1 className="mb-6 text-center font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        <T>Pricing Plans</T>
      </h1>
      <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-zinc-600 dark:text-zinc-400">
        <T>
          Start for free. Go <strong>Pro</strong> for chord diagrams{" "}
          <strong> without watermark</strong>, <strong>handdrawn style</strong>{" "}
          and <strong>no ads</strong>.
        </T>
      </p>

      <div className="mb-12 flex justify-center">
        <div className="inline-flex rounded-full border border-zinc-200 p-1 dark:border-zinc-800">
          {(["month", "year"] as const).map((interval) => (
            <button
              key={interval}
              onClick={() => setBillingInterval(interval)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                billingInterval === interval
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              <T>{interval === "month" ? "Monthly billing" : "Yearly billing"}</T>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
        <FreeProduct billingInterval={billingInterval} product={products[0]} />
        <Product billingInterval={billingInterval} product={products[0]} />
      </div>
    </section>
  );
}
