import Pricing from "@/components/Pricing";
import type { ProductWithPrice } from "@/types";

export default function PricingContent({
  products,
  locale,
}: {
  products: ProductWithPrice[];
  locale: string;
}) {
  return <Pricing products={products} locale={locale} />;
}
