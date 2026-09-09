import { ProductWithPrice } from "../types";
import { FreeProduct } from "./FreeProduct";
import { Product } from "./Product";
import { T } from "@magic-translate/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  products: ProductWithPrice[];
}

export default function Pricing({ products }: Props) {
  return (
    <section>
      <h1 className="mb-6 text-center font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
        <T>Pricing Plans</T>
      </h1>
      <p className="mx-auto mb-12 max-w-2xl text-center text-lg text-muted-foreground">
        <span className="[.ads-off_&]:hidden">
          <T>
            Start for free. Go <strong>Pro</strong> for chord diagrams{" "}
            <strong> without watermark</strong>,{" "}
            <strong>handdrawn style</strong> and <strong>no ads</strong>.
          </T>
        </span>
        <span className="hidden [.ads-off_&]:inline">
          <T>
            Start for free. Go <strong>Pro</strong> for chord diagrams{" "}
            <strong> without watermark</strong> and{" "}
            <strong>handdrawn style</strong>.
          </T>
        </span>
      </p>

      <Tabs defaultValue="month" className="flex flex-col items-center">
        <TabsList>
          <TabsTrigger value="month">
            <T>Monthly billing</T>
          </TabsTrigger>
          <TabsTrigger value="year">
            <T>Yearly billing</T>
          </TabsTrigger>
        </TabsList>
        {(["month", "year"] as const).map((interval) => (
          <TabsContent
            key={interval}
            value={interval}
            className="mt-10 w-full"
          >
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
              <FreeProduct billingInterval={interval} product={products[0]} />
              <Product billingInterval={interval} product={products[0]} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
